import { NextRequest, NextResponse } from "next/server";
import { MultiDomainSearchOrchestrator, DomainSearchResult } from "@/server/mcp/search-adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawItems = Array.isArray(body) ? body : body.results || body.leads || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Expected an array of scraped results or 'results' key" },
        { status: 400 }
      );
    }

    const formattedResults: DomainSearchResult[] = rawItems.map((item: Record<string, unknown>) => ({
      name: String(item.name || item.companyName || "Unknown Business"),
      phoneCandidates: Array.isArray(item.phoneCandidates)
        ? (item.phoneCandidates as string[])
        : item.phone ? [String(item.phone)] : [],
      emailCandidates: Array.isArray(item.emailCandidates)
        ? (item.emailCandidates as string[])
        : item.email ? [String(item.email)] : [],
      website: item.website ? String(item.website) : null,
      location: item.location ? String(item.location) : null,
      category: item.category ? String(item.category) : null,
      employeeCount: typeof item.employeeCount === "number" ? item.employeeCount : null,
      snippets: Array.isArray(item.snippets) ? (item.snippets as string[]) : [],
      source: (item.source as DomainSearchResult["source"]) || "external_scraper",
      sourceUrl: item.sourceUrl ? String(item.sourceUrl) : null,
      rawMetadata: item,
    }));

    MultiDomainSearchOrchestrator.registerExternalResults(formattedResults);

    return NextResponse.json({
      success: true,
      message: `Successfully received and buffered ${formattedResults.length} external scraped records`,
      count: formattedResults.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
