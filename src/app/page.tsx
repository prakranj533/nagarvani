"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowRight, CheckCircle, Users, MessageSquare, TrendingUp, Shield, Search, 
  MapPin, ChevronRight, Star, X, Loader2, Navigation, Newspaper, AlertTriangle,
  Paperclip, Image as ImageIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { DEPARTMENTS, type Feedback, type LocalNews } from "@/lib/data";

const stats = [
  { label: "Feedbacks Submitted", value: "1,24,832", icon: MessageSquare, color: "text-blue-600" },
  { label: "Issues Resolved", value: "89,241", icon: CheckCircle, color: "text-green-600" },
  { label: "Citizens Engaged", value: "3,45,000+", icon: Users, color: "text-purple-600" },
  { label: "Response Rate", value: "72%", icon: TrendingUp, color: "text-orange-600" },
];

const steps = [
  { step: "01", title: "Enter Your Pincode", desc: "We instantly identify your MLA, MP and local body councillor based on your location.", icon: MapPin },
  { step: "02", title: "Choose Department", desc: "Select the relevant government department – Roads, Water, Health, Education and more.", icon: Search },
  { step: "03", title: "Describe Your Issue", desc: "Write what's wrong in your own words. Upload photos if needed. Simple and quick.", icon: MessageSquare },
  { step: "04", title: "Track & Get Action", desc: "Your feedback is forwarded to the right authority with your ticket ID. Track it live.", icon: TrendingUp },
];

const priorityColor: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusColor: Record<string, string> = {
  submitted: "bg-purple-100 text-purple-700",
  under_review: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

export default function Home() {
  const [userPincode, setUserPincode] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [nearbyIssues, setNearbyIssues] = useState<Feedback[]>([]);
  const [nearbyNews, setNearbyNews] = useState<LocalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [repInfo, setRepInfo] = useState<{mp: string; mla: string; constituency: string} | null>(null);

  // Load saved pincode on mount
  useEffect(() => {
    const saved = localStorage.getItem("nagarvaani_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserPincode(parsed.pincode);
      } catch {
        setShowLocationModal(true);
      }
    } else {
      setShowLocationModal(true);
    }
  }, []);

  // Fetch nearby content when pincode changes
  useEffect(() => {
    if (!userPincode) return;
    
    const fetchNearbyContent = async () => {
      setLoading(true);
      try {
        // Fetch issues
        const issuesRes = await fetch("/api/feedback");
        const issuesData = await issuesRes.json();
        
        // Sort by proximity to user's pincode
        const sortedIssues = sortByProximity(issuesData.data || [], userPincode);
        setNearbyIssues(sortedIssues.slice(0, 5));

        // Fetch news
        const newsRes = await fetch(`/api/news?pincode=${userPincode}`);
        const newsData = await newsRes.json();
        setNearbyNews(newsData.data?.slice(0, 3) || []);

        // Fetch rep info
        const repRes = await fetch(`/api/representatives?pincode=${userPincode}`);
        const repData = await repRes.json();
        if (repData.found) {
          setRepInfo({ mp: repData.mp, mla: repData.mla, constituency: repData.constituency });
        }
      } catch (err) {
        console.error("Failed to fetch nearby content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyContent();
  }, [userPincode]);

  const sortByProximity = (items: any[], pincode: string) => {
    const prefix = pincode.slice(0, 3);
    return items.sort((a, b) => {
      const aExact = a.pincode === pincode;
      const bExact = b.pincode === pincode;
      const aNearby = a.pincode?.startsWith(prefix);
      const bNearby = b.pincode?.startsWith(prefix);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (aNearby && !bNearby) return -1;
      if (!aNearby && bNearby) return 1;
      return (b.upvotes || 0) - (a.upvotes || 0);
    });
  };

  const saveLocation = () => {
    if (pincodeInput.length === 6) {
      const locationData = { pincode: pincodeInput, savedAt: new Date().toISOString() };
      localStorage.setItem("nagarvaani_location", JSON.stringify(locationData));
      setUserPincode(pincodeInput);
      setShowLocationModal(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Shield size={14} />
              Connected to Government of India Portals
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your Voice Reaches<br />
              <span className="text-yellow-300">Your Representatives</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Submit feedback on government programs directly to your MLA, MP and local authorities.
              We ensure the right people are notified and held accountable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-400 text-slate-900 font-bold rounded-xl hover:bg-yellow-300 transition-all text-lg shadow-lg"
              >
                Submit Your Feedback
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-lg"
              >
                Track My Complaint
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
              <s.icon size={28} className={`mx-auto mb-2 ${s.color}`} />
              <div className="text-2xl font-extrabold text-slate-800">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">How It Works</h2>
          <p className="text-slate-500 text-lg">Submit feedback in under 2 minutes. No registration required.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="text-5xl font-black text-blue-50 absolute top-4 right-4">{s.step}</div>
              <div className="bg-blue-100 rounded-xl p-3 w-fit mb-4">
                <s.icon size={22} className="text-blue-700" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
          >
            Start Now – It&apos;s Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Departments */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Government Departments</h2>
            <p className="text-slate-500">Your feedback reaches the correct department directly.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {DEPARTMENTS.map((d) => (
              <Link
                key={d.id}
                href={`/submit?dept=${d.id}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-center"
              >
                <span className="text-3xl">{d.icon}</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 leading-tight">{d.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/departments" className="text-blue-600 font-semibold hover:underline text-sm">View all departments & schemes →</Link>
          </div>
        </div>
      </section>

      {/* Location Bar */}
      {userPincode && (
        <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation size={18} className="animate-pulse" />
                <span className="font-medium text-sm">
                  Showing content for <span className="font-bold">{userPincode}</span>
                  {repInfo && (
                    <span className="text-emerald-100 ml-2 text-xs">
                      • {repInfo.mp} (MP) • {repInfo.mla} (MLA)
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
              >
                Change Location
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Nearby Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Nearby Issues */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={24} className="text-amber-500" />
                  {userPincode ? "Issues Near You" : "Recent Community Issues"}
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  {userPincode ? "Complaints from your area and nearby localities" : "Issues raised by citizens across India"}
                </p>
              </div>
              <Link href="/issues" className="text-blue-600 font-semibold hover:underline text-sm hidden sm:block">View All →</Link>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-100">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : nearbyIssues.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-500">No issues found in your area</p>
                <p className="text-sm text-slate-400 mt-1">Be the first to report!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/track?id=${issue.ticketId}`}
                    className="block bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                            {DEPARTMENTS.find(d => d.id === issue.department)?.icon} {DEPARTMENTS.find(d => d.id === issue.department)?.name}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColor[issue.priority]}`}>
                            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[issue.status]}`}>
                            {issue.status.replace("_", " ")}
                          </span>
                          {issue.pincode === userPincode && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                              Your Area
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 truncate">{issue.subject}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{issue.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {issue.pincode}
                          </span>
                          {issue.attachments && issue.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              {issue.attachments.some(a => a.type === "image") ? <ImageIcon size={12} /> : <Paperclip size={12} />}
                              {issue.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                          <Star size={14} fill="currentColor" />
                          {issue.upvotes}
                        </div>
                        <span className="text-xs text-slate-400">votes</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="text-center mt-4">
              <Link href="/issues" className="text-blue-600 font-semibold hover:underline text-sm">View All Issues →</Link>
            </div>
          </div>

          {/* Nearby News */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Newspaper size={24} className="text-indigo-500" />
                  {userPincode ? "News Near You" : "Local News"}
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  {userPincode ? "Community updates from your neighborhood" : "Hyperlocal news from across India"}
                </p>
              </div>
              <Link href="/news" className="text-blue-600 font-semibold hover:underline text-sm hidden sm:block">View All →</Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-100">
                <Loader2 size={28} className="animate-spin text-indigo-600" />
              </div>
            ) : nearbyNews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <div className="text-4xl mb-3">📰</div>
                <p className="text-slate-500">No local news yet</p>
                <p className="text-sm text-slate-400 mt-1">Share what's happening in your area!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/news`}
                    className="block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {news.images.length > 0 && (
                      <div className="h-32 overflow-hidden">
                        <img src={news.images[0]} alt={news.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {news.isBreaking && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-red-500 text-white rounded-full">BREAKING</span>
                        )}
                        <span className="text-xs text-slate-500">{formatDate(news.createdAt)}</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{news.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{news.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {news.location.pincode === userPincode ? "Your Area" : news.location.area || news.location.pincode}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="text-center mt-4">
              <Link href="/news" className="text-blue-600 font-semibold hover:underline text-sm">View All News →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Make Your Voice Heard</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Every feedback you submit creates accountability. Don&apos;t let issues go unreported.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-10 py-4 bg-yellow-400 text-slate-900 font-bold rounded-xl hover:bg-yellow-300 transition-all text-lg shadow-lg"
          >
            Submit Feedback Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-lg mb-3">🏛️ NagarVaani</div>
              <p className="text-sm leading-relaxed">Empowering citizens to connect with their government representatives and drive accountability.</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Quick Links</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/submit" className="hover:text-white transition-colors">Submit Feedback</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Status</Link></li>
                <li><Link href="/issues" className="hover:text-white transition-colors">Community Issues</Link></li>
                <li><Link href="/departments" className="hover:text-white transition-colors">Departments</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Government Links</div>
              <ul className="space-y-2 text-sm">
                <li><a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">PG Portal</a></li>
                <li><a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MyGov India</a></li>
                <li><a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Find Your MLA/MP</a></li>
                <li><a href="https://cpgrams.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">CPGRAMS</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Helpline Numbers</div>
              <ul className="space-y-2 text-sm">
                <li>National Helpline: <span className="text-white">1800-11-0001</span></li>
                <li>Roads: <span className="text-white">1033</span></li>
                <li>Power: <span className="text-white">1912</span></li>
                <li>Railways: <span className="text-white">139</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            <p>© 2024 NagarVaani. Built for citizens of India. | Data sourced from official Government of India portals.</p>
          </div>
        </div>
      </footer>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter Your Location</h2>
            <p className="text-slate-500 mb-6">
              Share your pincode to see news, issues, and updates from your area. 
              We&apos;ll show you the most relevant content first!
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode (e.g. 110001)"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pincodeInput.length > 0 && pincodeInput.length !== 6 && (
                  <p className="text-red-500 text-xs mt-2">Please enter a valid 6-digit pincode</p>
                )}
              </div>
              
              <button
                onClick={saveLocation}
                disabled={pincodeInput.length !== 6}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Show Content Near Me
              </button>
              
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setPincodeInput("");
                }}
                className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors"
              >
                Skip for now
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mt-4">
              Your location is stored locally on your device and is only used to show nearby content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
