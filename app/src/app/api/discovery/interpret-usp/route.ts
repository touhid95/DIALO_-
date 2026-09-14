import { NextRequest, NextResponse } from "next/server";
import {
  interpretUspProfile,
  extractUspFromFreeText,
  UspIntakeInput,
} from "@/server/services/usp-interpreter";
import { mcpLogger } from "@/server/mcp/mcp-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let { usp, price, location, targetCompanySize, targetIndustry, targetTitles, rawText } = body;

    // If free-form text is provided, extract parameters first
    if (rawText && typeof rawText === "string" && (!usp || !price || !location)) {
      const extracted = extractUspFromFreeText(rawText);
      if (extracted) {
        if (!usp && extracted.usp) usp = extracted.usp;
        if (!price && extracted.price) price = extracted.price;
        if (!location && extracted.location) location = extracted.location;
      }
    }

    if (!usp || typeof usp !== "string" || !usp.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required 'usp' (Unique Selling Proposition) field.",
        },
        { status: 400 }
      );
    }

    const intake: UspIntakeInput = {
      usp: usp.trim(),
      price: (price || "$250 trial").trim(),
      location: (location || "Austin, Texas").trim(),
      targetCompanySize: targetCompanySize ? String(targetCompanySize).trim() : undefined,
      targetIndustry: targetIndustry ? String(targetIndustry).trim() : undefined,
      targetTitles: Array.isArray(targetTitles) ? targetTitles : undefined,
    };

    mcpLogger.info(
      "ORCHESTRATOR",
      `[USP Interpretation] Running two-tier ML interpretation on USP: "${intake.usp}" (${intake.price}, ${intake.location})...`
    );

    const profile = await interpretUspProfile(intake);

    mcpLogger.success(
      "ORCHESTRATOR",
      `[USP Interpretation Complete] Inferred primary vertical "${profile.targetMarket.primaryIndustry}", ${profile.targetMarket.employeeSizeDisplay}, ${profile.apolloSearchCriteria.person_titles.length} titles.`,
      {
        primaryIndustry: profile.targetMarket.primaryIndustry,
        employeeRange: profile.targetMarket.employeeSizeDisplay,
        priceDisplay: profile.normalizedPrice.display,
        timezone: profile.normalizedLocation.timezone,
      }
    );

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    mcpLogger.error("ORCHESTRATOR", `[USP Interpretation Failed]: ${msg}`);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
