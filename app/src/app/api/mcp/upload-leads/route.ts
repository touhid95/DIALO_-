import { NextRequest, NextResponse } from "next/server";
import { parseUploadedFile } from "@/server/mcp/lead-importer";
import { mcpOrchestrator } from "@/server/mcp/mcp-orchestrator";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const importResult = await parseUploadedFile(buffer, file.name);

      if (!importResult.success || importResult.leads.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to parse file or no valid leads found",
            details: importResult.errors,
          },
          { status: 400 }
        );
      }

      // Process and store as distinct 'upload' dataset
      const processedLeads = await mcpOrchestrator.processImportedLeads(importResult.leads);

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${processedLeads.length} leads from ${file.name}`,
        totalParsed: importResult.total,
        importedCount: processedLeads.length,
        skippedCount: importResult.skipped,
        leads: processedLeads,
      });
    }

    // JSON payload support
    const body = await request.json();
    const rawLeads = Array.isArray(body) ? body : body.leads;

    if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
      return NextResponse.json({ success: false, error: "Expected 'leads' array in JSON body" }, { status: 400 });
    }

    const buffer = Buffer.from(JSON.stringify(rawLeads));
    const importResult = await parseUploadedFile(buffer, "upload.json");
    const processedLeads = await mcpOrchestrator.processImportedLeads(importResult.leads);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedLeads.length} leads from JSON`,
      importedCount: processedLeads.length,
      leads: processedLeads,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("POST /api/mcp/upload-leads error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
