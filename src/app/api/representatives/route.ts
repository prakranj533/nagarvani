import { NextRequest, NextResponse } from "next/server";
import { REPRESENTATIVE_DB } from "@/lib/data";

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode");
  if (!pincode) return NextResponse.json({ error: "pincode required" }, { status: 400 });

  const rep = REPRESENTATIVE_DB[pincode];
  if (rep) {
    return NextResponse.json({ found: true, pincode, ...rep });
  }

  // Fallback: generate plausible data for unknown pincodes
  const stateCode = pincode.slice(0, 2);
  const stateMap: Record<string, { state: string; mp: string; mla: string; localBody: string }> = {
    "11": { state: "Delhi", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "40": { state: "Maharashtra", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "56": { state: "Karnataka", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "70": { state: "West Bengal", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "60": { state: "Tamil Nadu", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "50": { state: "Telangana", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "22": { state: "Uttar Pradesh", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "30": { state: "Rajasthan", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
    "38": { state: "Gujarat", mp: "Local MP (lookup pending)", mla: "Local MLA (lookup pending)", localBody: "Municipal Councillor" },
  };
  const info = stateMap[stateCode] || { state: "India", mp: "Your Local MP", mla: "Your Local MLA", localBody: "Local Body Councillor" };

  return NextResponse.json({
    found: false,
    pincode,
    mp: info.mp,
    mla: info.mla,
    localBody: info.localBody,
    constituency: `Constituency for ${pincode}`,
    note: "Exact representative data – verify at https://electoralsearch.eci.gov.in",
  });
}
