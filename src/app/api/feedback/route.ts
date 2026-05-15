import { NextRequest, NextResponse } from "next/server";
import { Feedback } from "@/lib/data";

// In-memory store (replace with DB in production)
const feedbackStore: Feedback[] = [
  {
    id: "1",
    ticketId: "CFB-2024-001",
    name: "Ramesh Kumar",
    email: "ramesh@example.com",
    phone: "9876543210",
    pincode: "110001",
    state: "Delhi",
    district: "Central Delhi",
    department: "roads",
    subject: "Pothole on Main Road causing accidents",
    description: "There is a large pothole near Bus Stop No. 12, Main Road, Delhi. It has caused 3 accidents this week. Immediate repair needed.",
    priority: "high",
    mp: "Manoj Tiwari",
    mla: "Saurabh Bhardwaj",
    localBody: "NDMC Ward 1",
    constituency: "North East Delhi",
    status: "in_progress",
    createdAt: "2024-05-01T10:00:00Z",
    upvotes: 47,
    attachments: [
      {
        id: "att1",
        name: "pothole_photo_1.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
        size: 2457600,
        mimeType: "image/jpeg",
      },
      {
        id: "att2",
        name: "pothole_photo_2.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1565104425087-ecaa11baf556?w=800",
        size: 1892000,
        mimeType: "image/jpeg",
      },
    ],
  },
  {
    id: "2",
    ticketId: "CFB-2024-002",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9765432109",
    pincode: "400001",
    state: "Maharashtra",
    district: "Mumbai",
    department: "water",
    subject: "No water supply for 3 days in our area",
    description: "Residents of Sector 5 have not received tap water for 3 days. Elderly and children are badly affected. Urgent attention required.",
    priority: "critical",
    mp: "Arvind Sawant",
    mla: "Mangesh Kudalkar",
    localBody: "BMC Ward A",
    constituency: "Mumbai South",
    status: "under_review",
    createdAt: "2024-05-03T09:00:00Z",
    upvotes: 132,
    attachments: [
      {
        id: "att3",
        name: "empty_tap_video.mp4",
        type: "video",
        url: "https://example.com/videos/empty_tap.mp4",
        size: 5242880,
        mimeType: "video/mp4",
      },
    ],
  },
  {
    id: "3",
    ticketId: "CFB-2024-003",
    name: "Anil Singh",
    email: "anil@example.com",
    phone: "9654321098",
    pincode: "560001",
    state: "Karnataka",
    district: "Bengaluru Urban",
    department: "electricity",
    subject: "Frequent power cuts affecting businesses",
    description: "Power cuts are occurring 4-5 times daily for 2+ hours each time in our commercial area. Small businesses are suffering huge losses.",
    priority: "high",
    mp: "P.C. Mohan",
    mla: "Rizwan Arshad",
    localBody: "BBMP Ward 1",
    constituency: "Bengaluru Central",
    status: "resolved",
    createdAt: "2024-04-20T14:00:00Z",
    upvotes: 89,
    attachments: [],
  },
];

let idCounter = feedbackStore.length + 1;

export async function GET(req: NextRequest) {
  const dept = req.nextUrl.searchParams.get("department");
  const status = req.nextUrl.searchParams.get("status");
  const pincode = req.nextUrl.searchParams.get("pincode");

  let results = [...feedbackStore];
  if (dept) results = results.filter((f) => f.department === dept);
  if (status) results = results.filter((f) => f.status === status);
  if (pincode) results = results.filter((f) => f.pincode === pincode);

  results.sort((a, b) => b.upvotes - a.upvotes);
  return NextResponse.json({ total: results.length, data: results });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ["name", "email", "pincode", "state", "department", "subject", "description", "priority"];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }

  const ticketId = `CFB-${new Date().getFullYear()}-${String(idCounter + 1000).padStart(4, "0")}`;
  const newFeedback: Feedback = {
    id: String(++idCounter),
    ticketId,
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    pincode: body.pincode,
    state: body.state,
    district: body.district || "",
    department: body.department,
    subject: body.subject,
    description: body.description,
    priority: body.priority,
    mp: body.mp || "To be assigned",
    mla: body.mla || "To be assigned",
    localBody: body.localBody || "To be assigned",
    constituency: body.constituency || "",
    status: "submitted",
    createdAt: new Date().toISOString(),
    upvotes: 0,
    attachments: body.attachments || [],
  };

  feedbackStore.push(newFeedback);
  return NextResponse.json({ success: true, ticketId, id: newFeedback.id, attachments: newFeedback.attachments }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, action } = body;
  const item = feedbackStore.find((f) => f.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "upvote") item.upvotes++;
  if (action === "status" && body.status) item.status = body.status;

  return NextResponse.json({ success: true, item });
}
