/**
 * Lead Importer — CSV / XLSX / JSON Parser & Normalizer
 *
 * Ingests external lead lists uploaded by the user, normalizes columns,
 * and outputs clean RawLead items tagged with source: 'upload'.
 */

import * as XLSX from "xlsx";
import { verifyPhone } from "./phone-verifier";

export interface RawImportedLead {
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  location: string | null;
  category: string | null;
  employeeCount: number | null;
  decisionMaker: string | null;
  decisionMakerTitle: string | null;
  source: "upload";
  rawRow: Record<string, unknown>;
}

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  leads: RawImportedLead[];
  errors: string[];
}

/**
 * Normalizes header keys to standard names
 */
function findMatchingKey(row: Record<string, unknown>, patterns: RegExp[]): string | null {
  for (const key of Object.keys(row)) {
    const trimmed = key.trim();
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        return key;
      }
    }
  }
  return null;
}

function extractValue(row: Record<string, unknown>, patterns: RegExp[]): string | null {
  const matchedKey = findMatchingKey(row, patterns);
  if (!matchedKey) return null;
  const val = row[matchedKey];
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}

function parseEmployeeCount(val: string | null): number | null {
  if (!val) return null;
  const num = parseInt(val.replace(/[^\d]/g, ""), 10);
  return isNaN(num) ? null : num;
}

/**
 * Parses raw JSON rows or objects into RawImportedLead array
 */
export function normalizeRows(rows: Record<string, unknown>[]): { leads: RawImportedLead[]; skipped: number; errors: string[] } {
  const leads: RawImportedLead[] = [];
  const errors: string[] = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") {
      skipped++;
      continue;
    }

    // Name matchers
    const name = extractValue(row, [
      /^(company|company[-_\s]?name|business|business[-_\s]?name|name|account|organization)$/i,
      /title/i,
    ]);

    if (!name) {
      skipped++;
      errors.push(`Row ${i + 1} skipped: Missing company or business name`);
      continue;
    }

    // Phone matchers
    const rawPhone = extractValue(row, [
      /^(phone|phone[-_\s]?number|telephone|tel|cell|mobile|contact[-_\s]?number|direct[-_\s]?dial)$/i,
      /phone/i,
    ]);

    // Email matchers
    const email = extractValue(row, [
      /^(email|email[-_\s]?address|e-mail|mail|contact[-_\s]?email)$/i,
      /email/i,
    ]);

    // Website matchers
    const website = extractValue(row, [
      /^(website|url|web|domain|site)$/i,
      /website/i,
    ]);

    // Location matchers
    const location = extractValue(row, [
      /^(location|address|city|metro|market|area|state|city[-_\s]?state)$/i,
      /location/i,
      /address/i,
    ]);

    // Category / Industry matchers
    const category = extractValue(row, [
      /^(category|industry|sector|vertical|business[-_\s]?type)$/i,
      /industry/i,
    ]);

    // Employee count matchers
    const rawSize = extractValue(row, [
      /^(employees|employee[-_\s]?count|headcount|size|staff|company[-_\s]?size)$/i,
      /employee/i,
      /headcount/i,
    ]);

    // Decision Maker
    const decisionMaker = extractValue(row, [
      /^(decision[-_\s]?maker|contact[-_\s]?name|owner|ceo|full[-_\s]?name|contact|founder)$/i,
      /decision[-_\s]?maker/i,
    ]);

    const decisionMakerTitle = extractValue(row, [
      /^(title|role|job[-_\s]?title|position)$/i,
      /title/i,
    ]);

    // Verify phone normalization
    const phoneRes = verifyPhone(rawPhone);
    const resolvedPhone = phoneRes.e164 || rawPhone;

    leads.push({
      name,
      phone: resolvedPhone,
      email,
      website,
      location,
      category,
      employeeCount: parseEmployeeCount(rawSize),
      decisionMaker,
      decisionMakerTitle,
      source: "upload",
      rawRow: row,
    });
  }

  return { leads, skipped, errors };
}

/**
 * Parses file buffer (CSV, XLSX, or JSON) into standardized leads
 */
export async function parseUploadedFile(buffer: Buffer, filename: string): Promise<ImportResult> {
  const ext = filename.split(".").pop()?.toLowerCase();

  try {
    let rows: Record<string, unknown>[] = [];

    if (ext === "json") {
      const text = buffer.toString("utf8");
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : (parsed.leads || parsed.data || [parsed]);
    } else if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        return { success: false, total: 0, imported: 0, skipped: 0, leads: [], errors: ["Empty workbook"] };
      }
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
        defval: "",
      });
    } else {
      return { success: false, total: 0, imported: 0, skipped: 0, leads: [], errors: [`Unsupported file extension: .${ext}`] };
    }

    const { leads, skipped, errors } = normalizeRows(rows);

    return {
      success: true,
      total: rows.length,
      imported: leads.length,
      skipped,
      leads,
      errors: errors.slice(0, 10), // cap error sample
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      total: 0,
      imported: 0,
      skipped: 0,
      leads: [],
      errors: [`Parse failed: ${msg}`],
    };
  }
}
