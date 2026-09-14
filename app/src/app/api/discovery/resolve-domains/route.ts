import { NextRequest, NextResponse } from "next/server";
import { domainResolver } from "@/server/services/domain-resolver";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const industry = body.industry || "Dental & Healthcare Clinics";
    const location = body.location || "Austin, TX";
    const organizationId = body.organizationId;
    const maxDomains = typeof body.maxDomains === "number" ? body.maxDomains : 15;

    const domains = await domainResolver.resolveDomains({
      industry,
      location,
      organizationId,
      maxDomains,
    });

    return NextResponse.json({
      success: true,
      source: "api_domain_resolver",
      industry,
      location,
      domains,
      count: domains.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") || "Dental & Healthcare Clinics";
  const location = searchParams.get("location") || "Austin, TX";

  const domains = await domainResolver.resolveDomains({
    industry,
    location,
  });

  return NextResponse.json({
    success: true,
    source: "api_domain_resolver",
    domains,
    count: domains.length,
  });
}
