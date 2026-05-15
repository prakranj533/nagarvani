import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/lib/data";

// In-memory user store
const userStore: User[] = [
  {
    id: "user1",
    name: "Ramesh Kumar",
    email: "ramesh@example.com",
    phone: "9876543210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh",
    bio: "Local resident passionate about community development",
    location: { pincode: "110001", state: "Delhi", district: "Central Delhi", area: "Connaught Place" },
    joinedAt: "2024-01-15T10:00:00Z",
    isVerified: true,
    reputation: 1250,
    postsCount: 47,
  },
  {
    id: "user2",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9765432109",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    bio: "Journalism student covering local events",
    location: { pincode: "400001", state: "Maharashtra", district: "Mumbai", area: "Fort" },
    joinedAt: "2024-02-20T14:30:00Z",
    isVerified: false,
    reputation: 680,
    postsCount: 23,
  },
  {
    id: "user3",
    name: "Anil Singh",
    email: "anil@example.com",
    phone: "9654321098",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil",
    bio: "Tech professional working from home",
    location: { pincode: "560001", state: "Karnataka", district: "Bengaluru", area: "MG Road" },
    joinedAt: "2024-03-10T09:15:00Z",
    isVerified: true,
    reputation: 920,
    postsCount: 31,
  },
];

let userCounter = userStore.length;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");

  if (id) {
    const user = userStore.find((u) => u.id === id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  }

  if (email) {
    const user = userStore.find((u) => u.email === email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  }

  // Return all users (in production, this would be paginated)
  return NextResponse.json({ users: userStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ["name", "email", "location"];

  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  // Check if email already exists
  if (userStore.some((u) => u.email === body.email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const newUser: User = {
    id: `user${++userCounter}`,
    name: body.name,
    email: body.email,
    phone: body.phone || undefined,
    avatar: body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name.replace(/\s/g, "")}`,
    bio: body.bio || "",
    location: body.location,
    joinedAt: new Date().toISOString(),
    isVerified: false,
    reputation: 0,
    postsCount: 0,
  };

  userStore.push(newUser);

  return NextResponse.json({ 
    success: true, 
    user: newUser,
    message: "Profile created successfully!"
  }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  const user = userStore.find((u) => u.id === id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Update allowed fields
  if (updates.name) user.name = updates.name;
  if (updates.phone) user.phone = updates.phone;
  if (updates.bio !== undefined) user.bio = updates.bio;
  if (updates.avatar) user.avatar = updates.avatar;
  if (updates.location) user.location = { ...user.location, ...updates.location };

  return NextResponse.json({ success: true, user });
}
