/**
 * Phone Verifier — E.164 normalization + confidence scoring
 *
 * No external API required. Uses structural analysis:
 *  - Format validity (length, country code, area code)
 *  - US area code validity check
 *  - NANP line number validity
 *  - Heuristic type inference (toll-free, mobile prefix, VoIP)
 *
 * phoneScore 0-100 is used as input to callReadiness.
 */

export type PhoneType = "landline" | "mobile" | "tollfree" | "voip" | "invalid" | "unknown";

export interface PhoneVerificationResult {
  originalInput: string;
  e164: string | null;
  isValid: boolean;
  type: PhoneType;
  confidence: number; // 0-1
  phoneScore: number; // 0-100
  notes: string[];
}

// US NANP area codes that are actually assigned
const VALID_US_AREA_CODES = new Set([
  "201","202","203","204","205","206","207","208","209",
  "210","212","213","214","215","216","217","218","219",
  "220","223","224","225","227","228","229",
  "231","234","239","240","242","246","248","250","251","252","253","254","256","260","262",
  "267","268","269","270","272","276","279",
  "281","284",
  "301","302","303","304","305","306","307","308","309",
  "310","312","313","314","315","316","317","318","319",
  "320","321","323","325","330","331","332","334","336","337","339",
  "340","341","343","345","346","347","351","352","360","361","364",
  "380","385","386",
  "401","402","403","404","405","406","407","408","409",
  "410","412","413","414","415","416","417","418","419",
  "423","424","425","430","432","434","435","437","438","440","442","443","445","450",
  "458","463","464","469","470","473","475","478","479","480","484",
  "501","502","503","504","505","506","507","508","509",
  "510","512","513","514","515","516","517","518","519",
  "520","530","531","534","539","540","541","551","559","561","562","563","567","570","571","573","574","575","580","585","586",
  "601","602","603","604","605","606","607","608","609",
  "610","612","613","614","615","616","617","618","619",
  "620","623","626","628","629","630","631","636","641","646","647","650","651","657","660","661","662","667","669","670","671","678","681","682","684",
  "701","702","703","704","705","706","707","708","709",
  "712","713","714","715","716","717","718","719",
  "720","721","724","725","726","727","730","731","732","734","737","740","743","747","754","757","758","760","762","763","765","767","769","770","772","773","774","775","778","779","780","781","784","785","786","787",
  "801","802","803","804","805","806","807","808","809",
  "810","812","813","814","815","816","817","818","819",
  "820","825","828","829","830","831","832","833","838","843","845","847","848","849","850","854","856","857","858","859",
  "860","862","863","864","865","867","868","869","870","872","876","878",
  "900","901","902","903","904","905","906","907","908","909",
  "910","912","913","914","915","916","917","918","919",
  "920","925","928","929","930","931","934","936","937","938","939","940","941","947","949","951","952","954","956","959","970","971","972","973","975","978","979","980","984","985","986","989"
]);

const TOLL_FREE_PREFIXES = new Set(["800","833","844","855","866","877","888"]);
const MOBILE_AREA_HINTS = new Set(["832","346","713","281","469","214","817","972","682","512","737","945"]);

export function verifyPhone(input: string | null): PhoneVerificationResult {
  if (!input || input.trim() === "") {
    return { originalInput: input ?? "", e164: null, isValid: false, type: "invalid", confidence: 0, phoneScore: 0, notes: ["No phone number provided"] };
  }

  const clean = input.replace(/[^\d+]/g, "");
  const digits = clean.replace(/\D/g, "");
  const notes: string[] = [];

  // Length check
  if (digits.length < 7 || digits.length > 15) {
    return { originalInput: input, e164: null, isValid: false, type: "invalid", confidence: 0, phoneScore: 0, notes: [`Invalid length: ${digits.length} digits`] };
  }

  // Normalize to E.164
  let e164: string | null = null;
  let areaCode = "";

  if (digits.length === 10) {
    e164 = `+1${digits}`;
    areaCode = digits.slice(0, 3);
  } else if (digits.length === 11 && digits[0] === "1") {
    e164 = `+${digits}`;
    areaCode = digits.slice(1, 4);
  } else if (digits.length > 10) {
    e164 = `+${digits}`;
  }

  // US-specific checks
  if (e164 && e164.startsWith("+1") && areaCode) {
    if (TOLL_FREE_PREFIXES.has(areaCode)) {
      notes.push("Toll-free number");
      return { originalInput: input, e164, isValid: true, type: "tollfree", confidence: 0.5, phoneScore: 45, notes };
    }

    if (!VALID_US_AREA_CODES.has(areaCode)) {
      notes.push(`Area code ${areaCode} not in NANP assigned list`);
      return { originalInput: input, e164: null, isValid: false, type: "invalid", confidence: 0.1, phoneScore: 10, notes };
    }

    // Check exchange (NXX) — cannot start with 0 or 1
    const exchange = (digits.length === 10 ? digits : digits.slice(1)).slice(3, 6);
    if (exchange[0] === "0" || exchange[0] === "1") {
      notes.push(`Invalid exchange: ${exchange}`);
      return { originalInput: input, e164: null, isValid: false, type: "invalid", confidence: 0.1, phoneScore: 5, notes };
    }

    // Check subscriber number — cannot be all zeros
    const subscriber = (digits.length === 10 ? digits : digits.slice(1)).slice(6);
    if (subscriber === "0000" || subscriber === "1111" || subscriber === "0000") {
      notes.push("Suspicious subscriber number");
    }

    // Type inference
    let type: PhoneType = "landline";
    let confidence = 0.82;

    if (MOBILE_AREA_HINTS.has(areaCode)) {
      type = "mobile";
      confidence = 0.75; // could be either
      notes.push("Area code associated with mobile prefix patterns");
    } else {
      notes.push("Likely landline/business line");
    }

    // Bonus: well-formatted original input
    const hasFormatting = /[\s\-\(\)\.]+/.test(input);
    if (hasFormatting) {
      confidence = Math.min(0.95, confidence + 0.07);
      notes.push("Well-formatted input — higher confidence");
    }

    const phoneScore = Math.round(confidence * 100);

    return { originalInput: input, e164, isValid: true, type, confidence, phoneScore, notes };
  }

  // International number (non-US)
  if (e164) {
    notes.push("International number — lower confidence");
    return { originalInput: input, e164, isValid: true, type: "unknown", confidence: 0.6, phoneScore: 55, notes };
  }

  return { originalInput: input, e164: null, isValid: false, type: "invalid", confidence: 0, phoneScore: 0, notes: ["Could not parse number"] };
}

/** Score the best phone from a list */
export function pickBestPhone(phones: (string | null)[]): PhoneVerificationResult {
  const results = phones
    .filter((p): p is string => !!p)
    .map(verifyPhone)
    .filter((r) => r.isValid)
    .sort((a, b) => b.phoneScore - a.phoneScore);

  return results[0] ?? verifyPhone(null);
}
