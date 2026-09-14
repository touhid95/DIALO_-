import { NextRequest, NextResponse } from "next/server";
import { apolloService } from "@/server/services/apollo-service";

export async function GET() {
  try {
    const health = await apolloService.checkHealth();
    return NextResponse.json({
      success: true,
      service: "apollo_engine_free_tier",
      note: "Configured for zero-credit contacts/search. Restricts /people/show and /people/match.",
      health,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const keywords = body.keywords || "Dentist, Dental";
    const page = body.page || 1;
    const perPage = body.perPage || 25;
    const clientLocations = body.clientLocations || [];

    const result = await apolloService.searchContacts({
      keywords,
      page,
      perPage,
      clientLocations,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
