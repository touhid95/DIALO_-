import zlib from "zlib";

/**
 * PDF Text Extraction Utility
 * Tier 1: pdf-parse v2 (class-based) and v1 (function-based)
 * Tier 2: Zero-dependency raw stream inflate extractor (guaranteed fallback if worker fails)
 */

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Tier 1: Try pdf-parse
  try {
    const pdfModule = await import("pdf-parse");

    // Check for pdf-parse v2 (exports PDFParse class)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PDFParseClass = (pdfModule as any).PDFParse;
    if (typeof PDFParseClass === "function") {
      const parser = new PDFParseClass({ data: buffer });
      const result = await parser.getText();
      try {
        await parser.destroy?.();
      } catch {}
      const text = (result?.text || "").trim();
      if (text) return cleanExtractedText(text);
    }

    // Check for pdf-parse v1 (default export is a function)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultExport = (pdfModule as any).default || pdfModule;
    if (typeof defaultExport === "function") {
      const result = await defaultExport(buffer);
      const text = (result?.text || "").trim();
      if (text) return cleanExtractedText(text);
    }
  } catch (err) {
    console.warn("[extractPdfText] pdf-parse threw, falling back to raw stream extractor:", err);
  }

  // Tier 2: Zero-dependency raw PDF stream text extractor
  try {
    const rawText = extractTextFromPdfRaw(buffer);
    if (rawText) {
      return cleanExtractedText(rawText);
    }
  } catch (fallbackErr) {
    console.error("[extractPdfText] Raw stream extraction failed:", fallbackErr);
  }

  return "[PDF contained no readable text or failed to parse]";
}

/**
 * Fallback parser that inspects PDF streams, inflates FlateDecode blocks,
 * and collects text from Tj / TJ operators without requiring a worker thread.
 */
function extractTextFromPdfRaw(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const extractedPieces: string[] = [];

  // Find all stream ... endstream blocks
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(content)) !== null) {
    let streamBytes = Buffer.from(match[1], "latin1");

    // Decompress if compressed with FlateDecode
    try {
      streamBytes = zlib.inflateSync(streamBytes);
    } catch {
      // Stream might be uncompressed or use raw ASCII
    }

    const textStr = streamBytes.toString("utf-8");

    // Match (Text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(textStr)) !== null) {
      const clean = unescapePdfString(tjMatch[1].trim());
      if (clean) extractedPieces.push(clean);
    }

    // Match [ (Text1) 12 (Text2) ] TJ
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = tjArrayRegex.exec(textStr)) !== null) {
      const innerRegex = /\(([^)]*)\)/g;
      let m: RegExpExecArray | null;
      while ((m = innerRegex.exec(arrayMatch[1])) !== null) {
        const clean = unescapePdfString(m[1].trim());
        if (clean) extractedPieces.push(clean);
      }
    }
  }

  // If no streams contained Tj/TJ, search for any raw text strings in parenthetical format
  if (extractedPieces.length === 0) {
    const generalParenRegex = /\(([a-zA-Z0-9 .,:;!?'"&@\-_/\\#]{4,})\)/g;
    let pMatch: RegExpExecArray | null;
    while ((pMatch = generalParenRegex.exec(content)) !== null) {
      extractedPieces.push(pMatch[1].trim());
    }
  }

  return extractedPieces.join(" ").trim();
}

function unescapePdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
