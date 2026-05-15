export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export const DEPARTMENTS = [
  { id: "education", name: "Education", icon: "🎓", color: "bg-blue-100 text-blue-800", govUrl: "https://education.gov.in" },
  { id: "health", name: "Health & Family Welfare", icon: "🏥", color: "bg-red-100 text-red-800", govUrl: "https://mohfw.gov.in" },
  { id: "roads", name: "Roads & Transport", icon: "🛣️", color: "bg-yellow-100 text-yellow-800", govUrl: "https://morth.nic.in" },
  { id: "water", name: "Water & Sanitation", icon: "💧", color: "bg-cyan-100 text-cyan-800", govUrl: "https://jaljeevanmission.gov.in" },
  { id: "electricity", name: "Electricity & Power", icon: "⚡", color: "bg-purple-100 text-purple-800", govUrl: "https://powermin.gov.in" },
  { id: "agriculture", name: "Agriculture", icon: "🌾", color: "bg-green-100 text-green-800", govUrl: "https://agriculture.gov.in" },
  { id: "housing", name: "Housing & Urban Dev", icon: "🏠", color: "bg-orange-100 text-orange-800", govUrl: "https://mohua.gov.in" },
  { id: "police", name: "Police & Public Safety", icon: "👮", color: "bg-slate-100 text-slate-800", govUrl: "https://bprd.nic.in" },
  { id: "waste", name: "Waste Management", icon: "♻️", color: "bg-lime-100 text-lime-800", govUrl: "https://swachhbharatmission.gov.in" },
  { id: "welfare", name: "Social Welfare", icon: "🤝", color: "bg-pink-100 text-pink-800", govUrl: "https://socialjustice.gov.in" },
  { id: "railway", name: "Railways", icon: "🚂", color: "bg-indigo-100 text-indigo-800", govUrl: "https://indianrailways.gov.in" },
  { id: "telecom", name: "Telecom & Internet", icon: "📡", color: "bg-teal-100 text-teal-800", govUrl: "https://dot.gov.in" },
];

export const PRIORITY_LEVELS = [
  { id: "low", label: "Low – Minor inconvenience", color: "bg-green-100 text-green-700" },
  { id: "medium", label: "Medium – Affecting daily life", color: "bg-yellow-100 text-yellow-700" },
  { id: "high", label: "High – Urgent issue", color: "bg-orange-100 text-orange-700" },
  { id: "critical", label: "Critical – Public emergency", color: "bg-red-100 text-red-700" },
];

export const REPRESENTATIVE_DB: Record<string, { mp: string; mla: string; localBody: string; constituency: string }> = {
  "110001": { mp: "Manoj Tiwari", mla: "Saurabh Bhardwaj", localBody: "NDMC Ward 1", constituency: "North East Delhi" },
  "400001": { mp: "Arvind Sawant", mla: "Mangesh Kudalkar", localBody: "BMC Ward A", constituency: "Mumbai South" },
  "600001": { mp: "Dayanidhi Maran", mla: "B. Saravanan", localBody: "GCC Zone 1", constituency: "Central Chennai" },
  "700001": { mp: "Sudip Bandyopadhyay", mla: "Nayana Bandyopadhyay", localBody: "KMC Ward 1", constituency: "Kolkata Uttar" },
  "500001": { mp: "Asaduddin Owaisi", mla: "Ahmed Balala", localBody: "GHMC Zone 1", constituency: "Hyderabad" },
  "560001": { mp: "P.C. Mohan", mla: "Rizwan Arshad", localBody: "BBMP Ward 1", constituency: "Bengaluru Central" },
  "380001": { mp: "Amit Shah", mla: "Bhupendrasinh Patel", localBody: "AMC Zone 1", constituency: "Gandhinagar" },
  "302001": { mp: "Ramcharan Bohra", mla: "Satadev Acharya", localBody: "JMC Ward 1", constituency: "Jaipur" },
  "226001": { mp: "Rajnath Singh", mla: "Neeraj Bora", localBody: "LMC Zone 1", constituency: "Lucknow" },
  "411001": { mp: "Murlidhar Mohol", mla: "Mukta Tilak", localBody: "PMC Zone 1", constituency: "Pune" },
};

export const GOV_SCHEMES = [
  { name: "PM Awas Yojana", dept: "housing", url: "https://pmaymis.gov.in", description: "Affordable housing for all" },
  { name: "Swachh Bharat Abhiyan", dept: "waste", url: "https://swachhbharat.mygov.in", description: "Clean India mission" },
  { name: "Jal Jeevan Mission", dept: "water", url: "https://jaljeevanmission.gov.in", description: "Tap water to every household" },
  { name: "PM Kisan Samman Nidhi", dept: "agriculture", url: "https://pmkisan.gov.in", description: "Income support to farmers" },
  { name: "Ayushman Bharat", dept: "health", url: "https://pmjay.gov.in", description: "Health insurance for poor" },
  { name: "PM Gram Sadak Yojana", dept: "roads", url: "https://pmgsy.nic.in", description: "Rural road connectivity" },
];

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "audio";
  url: string;
  size: number;
  mimeType: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  phone: string;
  pincode: string;
  state: string;
  district: string;
  department: string;
  subject: string;
  description: string;
  priority: string;
  mp: string;
  mla: string;
  localBody: string;
  constituency: string;
  status: "submitted" | "under_review" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  ticketId: string;
  upvotes: number;
  attachments: Attachment[];
}

export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"],
  documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
  videos: ["video/mp4", "video/quicktime", "video/webm"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Hyperlocal News Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location: {
    pincode: string;
    state: string;
    district?: string;
    area?: string;
  };
  joinedAt: string;
  isVerified: boolean;
  reputation: number;
  postsCount: number;
}

export interface LocalNews {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: NewsCategory;
  author: User;
  location: {
    pincode: string;
    state: string;
    district?: string;
    area?: string;
    landmark?: string;
  };
  images: string[];
  createdAt: string;
  updatedAt?: string;
  likes: number;
  views: number;
  comments: NewsComment[];
  isBreaking: boolean;
  isVerified: boolean;
  tags: string[];
}

export interface NewsComment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
}

export type NewsCategory =
  | "community"
  | "safety"
  | "events"
  | "infrastructure"
  | "business"
  | "education"
  | "health"
  | "environment"
  | "traffic"
  | "other";

export const NEWS_CATEGORIES: { id: NewsCategory; label: string; icon: string; color: string }[] = [
  { id: "community", label: "Community", icon: "👥", color: "bg-blue-100 text-blue-700" },
  { id: "safety", label: "Safety & Security", icon: "🛡️", color: "bg-red-100 text-red-700" },
  { id: "events", label: "Events", icon: "📅", color: "bg-purple-100 text-purple-700" },
  { id: "infrastructure", label: "Infrastructure", icon: "🏗️", color: "bg-orange-100 text-orange-700" },
  { id: "business", label: "Business", icon: "💼", color: "bg-green-100 text-green-700" },
  { id: "education", label: "Education", icon: "📚", color: "bg-indigo-100 text-indigo-700" },
  { id: "health", label: "Health", icon: "🏥", color: "bg-pink-100 text-pink-700" },
  { id: "environment", label: "Environment", icon: "🌳", color: "bg-emerald-100 text-emerald-700" },
  { id: "traffic", label: "Traffic", icon: "🚗", color: "bg-yellow-100 text-yellow-700" },
  { id: "other", label: "Other", icon: "📌", color: "bg-slate-100 text-slate-700" },
];
