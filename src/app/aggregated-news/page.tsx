"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Newspaper, 
  MapPin, 
  Search, 
  Filter, 
  Loader2, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Globe,
  Building2,
  TrendingUp,
  X,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { formatTimeAgo, type ScrapedNewsItem } from "@/lib/scraper";

const CATEGORIES = [
  { id: "all", label: "All News", icon: "📰" },
  { id: "government", label: "Government", icon: "🏛️" },
  { id: "infrastructure", label: "Infrastructure", icon: "🏗️" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "transport", label: "Transport", icon: "🚇" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "environment", label: "Environment", icon: "🌳" },
];

const CITIES = [
  { name: "Delhi", pincodes: ["110001", "110002", "110003"] },
  { name: "Mumbai", pincodes: ["400001", "400002", "400003"] },
  { name: "Bengaluru", pincodes: ["560001", "560002", "560003"] },
  { name: "Chennai", pincodes: ["600001", "600002", "600003"] },
  { name: "Kolkata", pincodes: ["700001", "700002", "700003"] },
  { name: "Hyderabad", pincodes: ["500001", "500002", "500003"] },
  { name: "Pune", pincodes: ["411001", "411002", "411003"] },
];

export default function AggregatedNewsPage() {
  const [news, setNews] = useState<ScrapedNewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<ScrapedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPincode, setUserPincode] = useState<string>("");
  const [meta, setMeta] = useState({
    categories: [] as string[],
    sources: [] as string[],
    cities: [] as string[],
    lastUpdated: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ScrapedNewsItem | null>(null);

  // Load saved location
  useEffect(() => {
    const saved = localStorage.getItem("nagarvaani_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserPincode(parsed.pincode);
        // Find city from pincode
        const city = CITIES.find(c => c.pincodes.includes(parsed.pincode));
        if (city) setSelectedCity(city.name);
      } catch {}
    }
  }, []);

  // Fetch news
  const fetchNews = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (userPincode) params.append("pincode", userPincode);
      if (selectedCity && !userPincode) params.append("city", selectedCity);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      if (refresh) params.append("refresh", "true");

      const res = await fetch(`/api/scrape-news?${params}`);
      const data = await res.json();
      
      setNews(data.data);
      setFilteredNews(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedCity, userPincode]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchNews();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = () => fetchNews(true);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName === selectedCity ? "" : cityName);
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setUserPincode(city.pincodes[0]);
      localStorage.setItem("nagarvaani_location", JSON.stringify({ pincode: city.pincodes[0] }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Globe size={28} />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold">Aggregated Local News</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Real-time news from {meta.sources.length}+ sources across India
              </p>
              {meta.lastUpdated && (
                <p className="text-blue-200 text-sm mt-2">
                  Last updated: {new Date(meta.lastUpdated).toLocaleString("en-IN")}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/30 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
              >
                {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                <span className="font-medium">{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-xl font-medium transition-colors ${
                showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter size={18} />
              Filters
              {(selectedCategory !== "all" || selectedCity) && (
                <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {(selectedCategory !== "all" ? 1 : 0) + (selectedCity ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
              {/* Cities */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <MapPin size={14} />
                  Select City
                </label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleCitySelect(city.name)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCity === city.name
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== "all" || selectedCity || searchQuery) && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-slate-500">Active:</span>
                  {selectedCity && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      <MapPin size={12} />
                      {selectedCity}
                      <button onClick={() => { setSelectedCity(""); setUserPincode(""); }}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                      {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                      <button onClick={() => setSelectedCategory("all")}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                      <Search size={12} />
                      &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery("")}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => { setSelectedCategory("all"); setSelectedCity(""); setUserPincode(""); setSearchQuery(""); }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No news found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery 
                ? `No results for &quot;${searchQuery}&quot;` 
                : selectedCity 
                  ? `No news from ${selectedCity} at the moment`
                  : "No news available. Try adjusting your filters."}
            </p>
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedCity(""); setSearchQuery(""); }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main News Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Results count */}
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                  Showing <span className="font-semibold text-slate-800">{filteredNews.length}</span> articles
                  {selectedCity && <span> from <span className="font-semibold">{selectedCity}</span></span>}
                </p>
              </div>

              {/* News Cards */}
              {filteredNews.map((article, index) => (
                <article
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  {article.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        {article.source}
                      </span>
                      {article.category && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">
                          {article.category}
                        </span>
                      )}
                      {article.location?.city && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <MapPin size={10} />
                          {article.location.city}
                        </span>
                      )}
                      {userPincode && article.location?.pincode === userPincode && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Your Area
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {article.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} />
                        {formatTimeAgo(article.pubDate)}
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                        Read more
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Cities */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-orange-500" />
                  Trending Cities
                </h3>
                <div className="space-y-3">
                  {CITIES.slice(0, 5).map((city, i) => (
                    <button
                      key={city.name}
                      onClick={() => handleCitySelect(city.name)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium text-slate-700">{city.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* News Sources */}
              {meta.sources.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 size={18} className="text-indigo-500" />
                    News Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {meta.sources.map((source) => (
                      <span
                        key={source}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Stats */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.slice(1).map((cat) => {
                    const count = news.filter(n => n.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                          selectedCategory === cat.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span>{cat.icon}</span>
                          {cat.label}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-3">Share Local News</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Have news from your area? Share it with the community!
                </p>
                <a
                  href="/news"
                  className="block w-full py-3 bg-white/10 border border-white/30 rounded-xl text-center font-medium hover:bg-white/20 transition-colors"
                >
                  Post News
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedArticle.imageUrl && (
              <div className="h-64 overflow-hidden">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                  {selectedArticle.source}
                </span>
                {selectedArticle.category && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">
                    {selectedArticle.category}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {selectedArticle.title}
              </h2>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatTimeAgo(selectedArticle.pubDate)}
                </span>
                {selectedArticle.location?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedArticle.location.city}
                    {selectedArticle.location.pincode && ` – ${selectedArticle.location.pincode}`}
                  </span>
                )}
              </div>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                {selectedArticle.description}
              </p>
              
              <div className="flex gap-3">
                <a
                  href={selectedArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Read Full Article
                </a>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
