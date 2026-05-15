import { NextRequest, NextResponse } from "next/server";
import type { LocalNews, User } from "@/lib/data";

// Sample users
const sampleUsers: User[] = [
  {
    id: "user1",
    name: "Ramesh Kumar",
    email: "ramesh@example.com",
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
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil",
    bio: "Tech professional working from home",
    location: { pincode: "560001", state: "Karnataka", district: "Bengaluru", area: "MG Road" },
    joinedAt: "2024-03-10T09:15:00Z",
    isVerified: true,
    reputation: 920,
    postsCount: 31,
  },
];

// Sample news data
const newsStore: LocalNews[] = [
  {
    id: "news1",
    title: "New Community Park Opening This Weekend",
    summary: "The much-awaited Central Park renovation is complete and will be inaugurated on Saturday.",
    content: "After months of construction, the Central Park in Connaught Place is finally ready for public use. The park now features new jogging tracks, children's play areas, and senior citizen seating zones. The inauguration ceremony will be held at 10 AM on Saturday, with local MLA Saurabh Bhardwaj as the chief guest. Residents are invited to attend and share their feedback on the new facilities.",
    category: "community",
    author: sampleUsers[0],
    location: { pincode: "110001", state: "Delhi", district: "Central Delhi", area: "Connaught Place", landmark: "Near Rajiv Chowk Metro" },
    images: ["https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?w=800"],
    createdAt: "2024-05-10T08:00:00Z",
    likes: 234,
    views: 1205,
    comments: [],
    isBreaking: false,
    isVerified: true,
    tags: ["park", "inauguration", "community"],
  },
  {
    id: "news2",
    title: "Water Supply Disruption in South Delhi Areas",
    summary: "DJB announces 24-hour water supply cut for maintenance work in multiple areas.",
    content: "The Delhi Jal Board has announced a 24-hour water supply disruption starting from Wednesday 8 AM due to maintenance work on the main pipeline. Areas affected include Lajpat Nagar, Greater Kailash, CR Park, and Nehru Place. Residents are advised to store sufficient water in advance. Water tankers will be deployed in critical areas. The work is expected to be completed by Thursday morning.",
    category: "infrastructure",
    author: sampleUsers[0],
    location: { pincode: "110024", state: "Delhi", district: "South Delhi", area: "Lajpat Nagar" },
    images: [],
    createdAt: "2024-05-12T06:30:00Z",
    likes: 89,
    views: 2150,
    comments: [],
    isBreaking: true,
    isVerified: true,
    tags: ["water", "disruption", "maintenance"],
  },
  {
    id: "news3",
    title: "Local School Wins National Science Competition",
    summary: "Students from Delhi Public School brought home the trophy from the National Science Fair.",
    content: "Students from Delhi Public School, R.K. Puram have made the city proud by winning the first prize at the National Science Competition held in Bangalore. The team of 5 students developed an innovative water purification system using locally available materials. The Principal announced a special felicitation ceremony next week. This is the third consecutive year the school has won at the national level.",
    category: "education",
    author: sampleUsers[0],
    location: { pincode: "110022", state: "Delhi", district: "South West Delhi", area: "R.K. Puram" },
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"],
    createdAt: "2024-05-11T16:00:00Z",
    likes: 456,
    views: 3400,
    comments: [],
    isBreaking: false,
    isVerified: true,
    tags: ["school", "achievement", "science"],
  },
  {
    id: "news4",
    title: "Road Safety Campaign Launched in Mumbai",
    summary: "Traffic police initiative aims to reduce accidents by 50% in the next 6 months.",
    content: "The Mumbai Traffic Police has launched a comprehensive road safety campaign titled 'Safe Streets Mumbai'. The initiative includes installation of new speed cameras, pedestrian crossings, and awareness programs in schools and colleges. Special focus is being given to helmet enforcement for two-wheeler riders. The campaign was inaugurated by the Police Commissioner at Marine Drive on Monday.",
    category: "safety",
    author: sampleUsers[1],
    location: { pincode: "400001", state: "Maharashtra", district: "Mumbai", area: "Fort" },
    images: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800"],
    createdAt: "2024-05-13T11:00:00Z",
    likes: 178,
    views: 1890,
    comments: [],
    isBreaking: false,
    isVerified: true,
    tags: ["traffic", "safety", "campaign"],
  },
  {
    id: "news5",
    title: "Weekend Farmers Market at MG Road",
    summary: "Organic produce directly from farmers every Saturday and Sunday.",
    content: "A new farmers market has started at MG Road, offering fresh organic produce directly from farmers in the surrounding districts. The market operates every weekend from 7 AM to 1 PM. Visitors can find seasonal vegetables, fruits, dairy products, and homemade pickles. The initiative supports local farmers and promotes organic farming. Early birds get the best selection!",
    category: "business",
    author: sampleUsers[2],
    location: { pincode: "560001", state: "Karnataka", district: "Bengaluru", area: "MG Road" },
    images: ["https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800"],
    createdAt: "2024-05-09T07:00:00Z",
    likes: 312,
    views: 2100,
    comments: [],
    isBreaking: false,
    isVerified: false,
    tags: ["market", "organic", "farmers"],
  },
];

let newsCounter = newsStore.length;

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode");
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search");
  const authorId = req.nextUrl.searchParams.get("author");

  let results = [...newsStore];

  // Filter by pincode (exact match or nearby - for demo we show exact + partial matches)
  if (pincode) {
    const pinPrefix = pincode.slice(0, 3);
    results = results.filter((n) => 
      n.location.pincode === pincode || 
      n.location.pincode.startsWith(pinPrefix)
    );
  }

  if (category) results = results.filter((n) => n.category === category);
  if (authorId) results = results.filter((n) => n.author.id === authorId);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((n) => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort by date (newest first), with breaking news pinned to top
  results.sort((a, b) => {
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ 
    total: results.length, 
    data: results,
    pincodes: [...new Set(newsStore.map(n => n.location.pincode))],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ["title", "content", "summary", "category", "author", "location"];
  
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const newNews: LocalNews = {
    id: `news${++newsCounter}`,
    title: body.title,
    content: body.content,
    summary: body.summary,
    category: body.category,
    author: body.author,
    location: body.location,
    images: body.images || [],
    createdAt: new Date().toISOString(),
    likes: 0,
    views: 0,
    comments: [],
    isBreaking: body.isBreaking || false,
    isVerified: false,
    tags: body.tags || [],
  };

  newsStore.unshift(newNews);
  
  return NextResponse.json({ 
    success: true, 
    news: newNews,
    message: "News posted successfully! It will be visible after moderation."
  }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, action } = body;
  
  const news = newsStore.find((n) => n.id === id);
  if (!news) return NextResponse.json({ error: "News not found" }, { status: 404 });

  if (action === "like") {
    news.likes += 1;
    return NextResponse.json({ success: true, likes: news.likes });
  }
  
  if (action === "view") {
    news.views += 1;
    return NextResponse.json({ success: true, views: news.views });
  }

  if (action === "verify") {
    news.isVerified = true;
    return NextResponse.json({ success: true, verified: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
