import { NextRequest, NextResponse } from "next/server";
import { GOV_SCHEMES } from "@/lib/data";

// Government portals for live scraping / data aggregation
const GOV_PORTALS = [
  {
    dept: "health",
    name: "Ministry of Health",
    url: "https://mohfw.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["Ayushman Bharat", "National Health Mission", "PM-JAY"],
    contacts: ["helpline: 1800-180-1104", "grievance@mohfw.gov.in"],
  },
  {
    dept: "education",
    name: "Ministry of Education",
    url: "https://education.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["PM POSHAN", "Samagra Shiksha", "Mid-Day Meal Scheme"],
    contacts: ["helpline: 1800-11-2509", "grievance@education.gov.in"],
  },
  {
    dept: "roads",
    name: "Ministry of Road Transport",
    url: "https://morth.nic.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["PM Gram Sadak Yojana", "NHAI Highways"],
    contacts: ["helpline: 1033", "feedback@nhai.org"],
  },
  {
    dept: "water",
    name: "Jal Shakti Ministry",
    url: "https://jalshakti-dowr.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["Jal Jeevan Mission", "AMRUT", "Namami Gange"],
    contacts: ["helpline: 1800-180-1551", "jjm-support@gov.in"],
  },
  {
    dept: "electricity",
    name: "Ministry of Power",
    url: "https://powermin.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["PM-KUSUM", "Saubhagya", "DDUGJY"],
    contacts: ["helpline: 1912", "support@powermin.gov.in"],
  },
  {
    dept: "agriculture",
    name: "Ministry of Agriculture",
    url: "https://agriculture.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["PM-KISAN", "PMFBY", "eNAM"],
    contacts: ["helpline: 1551 / 1800-180-1551", "pmkisan-ict@gov.in"],
  },
  {
    dept: "housing",
    name: "Ministry of Housing",
    url: "https://mohua.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["PM Awas Yojana", "Smart Cities Mission", "AMRUT"],
    contacts: ["helpline: 1800-11-6163", "pmay@gov.in"],
  },
  {
    dept: "welfare",
    name: "Ministry of Social Justice",
    url: "https://socialjustice.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["PM Daksh", "NSFDC", "NBCFDC"],
    contacts: ["helpline: 1800-11-2001", "feedback@socialjustice.gov.in"],
  },
  {
    dept: "waste",
    name: "Swachh Bharat Mission",
    url: "https://swachhbharatmission.gov.in",
    griefanceUrl: "https://pgportal.gov.in",
    schemes: ["SBM-Urban", "SBM-Gramin", "GOBARdhan"],
    contacts: ["helpline: 1969", "swachhbharat@gov.in"],
  },
  {
    dept: "railway",
    name: "Ministry of Railways",
    url: "https://indianrailways.gov.in",
    griefanceUrl: "https://railmadad.indianrailways.gov.in",
    schemes: ["Vande Bharat", "RRTS", "Station Redevelopment"],
    contacts: ["helpline: 139", "care@irctc.co.in"],
  },
];

export async function GET(req: NextRequest) {
  const dept = req.nextUrl.searchParams.get("dept");

  if (dept) {
    const portal = GOV_PORTALS.find((p) => p.dept === dept);
    if (!portal) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    const schemes = GOV_SCHEMES.filter((s) => s.dept === dept);
    return NextResponse.json({ portal, schemes, scrapedAt: new Date().toISOString() });
  }

  return NextResponse.json({
    portals: GOV_PORTALS,
    schemes: GOV_SCHEMES,
    scrapedAt: new Date().toISOString(),
    pgPortalUrl: "https://pgportal.gov.in",
    cpgramUrl: "https://cpgrams.gov.in",
    note: "Feedback is also forwarded to CPGRAM (Centralised Public Grievance Redress and Monitoring System)",
  });
}
