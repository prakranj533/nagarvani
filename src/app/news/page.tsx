"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { NEWS_CATEGORIES, type LocalNews, type User } from "@/lib/data";
import { 
  MapPin, 
  Search, 
  Filter, 
  Loader2, 
  Heart, 
  Eye, 
  Clock,
  User as UserIcon,
  TrendingUp,
  Plus,
  Navigation,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function NewsPage() {
  const [news, setNews] = useState<LocalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [nearbyMode, setNearbyMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  // Load news
  useEffect(() => {
    fetchNews();
  }, []);

  // Try to load user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nagarvaani_user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.data);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter news
  const filteredNews = news.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && 
          !item.content.toLowerCase().includes(q) &&
          !item.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    if (pincode) {
      // Show exact matches first, then nearby (same first 3 digits)
      const prefix = pincode.slice(0, 3);
      return item.location.pincode === pincode || 
             item.location.pincode.startsWith(prefix);
    }
    return true;
  }).sort((a, b) => {
    // Sort by relevance to pincode if entered
    if (pincode) {
      const aExact = a.location.pincode === pincode;
      const bExact = b.location.pincode === pincode;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
    }
    // Breaking news first, then by date
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleLike = async (id: string) => {
    try {
      await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "like" }),
      });
      setNews(prev => prev.map(n => n.id === id ? { ...n, likes: n.likes + 1 } : n));
    } catch {}
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
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">📰 Hyperlocal News</h1>
              <p className="text-indigo-100">Community-powered news from your neighborhood</p>
            </div>
            <div className="flex gap-3">
              {!currentUser ? (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Create Profile
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full bg-white" />
                  <div className="hidden sm:block">
                    <div className="font-semibold text-sm">{currentUser.name}</div>
                    <div className="text-xs text-indigo-200">{currentUser.location.pincode}</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowPostModal(true)}
                className="px-5 py-2.5 bg-yellow-400 text-indigo-900 font-semibold rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Post News
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pincode input */}
            <div className="relative flex-1 max-w-xs">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter your pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Categories</option>
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {(pincode || categoryFilter || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {pincode && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  <MapPin size={12} />
                  Pincode: {pincode}
                  <button onClick={() => setPincode("")}><X size={14} /></button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <Filter size={12} />
                  {NEWS_CATEGORIES.find(c => c.id === categoryFilter)?.label}
                  <button onClick={() => setCategoryFilter("")}><X size={14} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                  <Search size={12} />
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")}><X size={14} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* News Feed */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No news found</h3>
            <p className="text-slate-500 mb-6">
              {pincode 
                ? `No news from ${pincode} yet. Be the first to share!` 
                : "Select your pincode or search to find local news"}
            </p>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Share Local News
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main feed */}
            <div className="lg:col-span-2 space-y-6">
              {filteredNews.map((item) => {
                const category = NEWS_CATEGORIES.find(c => c.id === item.category);
                const isNearby = pincode && item.location.pincode !== pincode && item.location.pincode.startsWith(pincode.slice(0, 3));
                
                return (
                  <article 
                    key={item.id} 
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    {item.images.length > 0 && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    
                    <div className="p-5">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {item.isBreaking && (
                          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                            BREAKING
                          </span>
                        )}
                        {category && (
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${category.color}`}>
                            {category.icon} {category.label}
                          </span>
                        )}
                        {isNearby && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            📍 Nearby ({item.location.pincode})
                          </span>
                        )}
                        {item.location.pincode === pincode && (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            ✅ Your Area
                          </span>
                        )}
                        {item.isVerified && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-slate-800 mb-2 hover:text-indigo-600 transition-colors cursor-pointer">
                        {item.title}
                      </h2>

                      {/* Summary */}
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {item.summary}
                      </p>

                      {/* Author & Location */}
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={item.author.avatar} 
                          alt={item.author.name}
                          className="w-8 h-8 rounded-full bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">{item.author.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} />
                            {item.location.area}, {item.location.district}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {item.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => handleLike(item.id)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Heart size={18} />
                          <span className="text-sm font-medium">{item.likes}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Eye size={18} />
                          <span className="text-sm">{item.views}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                          <Clock size={16} />
                          <span className="text-sm">{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Total News</span>
                    <span className="font-bold text-slate-800">{news.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Active Pincodes</span>
                    <span className="font-bold text-slate-800">
                      {new Set(news.map(n => n.location.pincode)).size}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Breaking News</span>
                    <span className="font-bold text-red-600">
                      {news.filter(n => n.isBreaking).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-4">Categories</h3>
                <div className="space-y-2">
                  {NEWS_CATEGORIES.map(cat => {
                    const count = news.filter(n => n.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id === categoryFilter ? "" : cat.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                          categoryFilter === cat.id 
                            ? "bg-indigo-50 text-indigo-700" 
                            : "hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.label}</span>
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserIcon size={18} className="text-indigo-600" />
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {Array.from(new Set(news.map(n => n.author)))
                    .sort((a, b) => b.reputation - a.reputation)
                    .slice(0, 5)
                    .map(user => (
                      <div key={user.id} className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 text-sm truncate">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.postsCount} posts • {user.reputation} pts</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          onClose={() => setShowProfileModal(false)} 
          onSave={(user) => {
            setCurrentUser(user);
            localStorage.setItem("nagarvaani_user", JSON.stringify(user));
            setShowProfileModal(false);
          }}
        />
      )}

      {/* Post News Modal */}
      {showPostModal && (
        <PostNewsModal
          user={currentUser}
          onClose={() => setShowPostModal(false)}
          onPost={(newsItem) => {
            setNews(prev => [newsItem, ...prev]);
            setShowPostModal(false);
          }}
        />
      )}
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ onClose, onSave }: { onClose: () => void; onSave: (user: User) => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    pincode: "",
    state: "",
    district: "",
    area: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          bio: form.bio,
          location: {
            pincode: form.pincode,
            state: form.state,
            district: form.district,
            area: form.area,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSave(data.user);
      } else {
        setError(data.error || "Failed to create profile");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Create Your Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode *</label>
            <input
              required
              type="text"
              maxLength={6}
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Area/Locality</label>
            <input
              type="text"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Post News Modal Component
function PostNewsModal({ 
  user, 
  onClose, 
  onPost 
}: { 
  user: User | null; 
  onClose: () => void; 
  onPost: (news: LocalNews) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "community" as const,
    isBreaking: false,
    tags: "",
    pincode: user?.location.pincode || "",
    landmark: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please create a profile first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: form.content,
          category: form.category,
          author: user,
          location: {
            pincode: form.pincode || user.location.pincode,
            state: user.location.state,
            district: user.location.district,
            area: user.location.area,
            landmark: form.landmark,
          },
          images: [],
          isBreaking: form.isBreaking,
          tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onPost(data.news);
      } else {
        setError(data.error || "Failed to post news");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Required</h2>
          <p className="text-slate-500 mb-6">Please create a profile to share local news with your community.</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Share Local News</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Headline *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's happening?"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Summary *</label>
            <input
              required
              type="text"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Brief summary (1-2 sentences)"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Story *</label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Share the complete details..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {NEWS_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode *</label>
              <input
                required
                type="text"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Landmark (optional)</label>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              placeholder="e.g., Near City Mall, Main Market"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g., festival, road, school, accident"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
            <input
              type="checkbox"
              id="breaking"
              checked={form.isBreaking}
              onChange={(e) => setForm({ ...form, isBreaking: e.target.checked })}
              className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
            />
            <label htmlFor="breaking" className="text-sm font-medium text-amber-800">
              Mark as Breaking News (urgent/important)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post News"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
