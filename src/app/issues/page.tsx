"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MapPin, ThumbsUp, Filter, Search, Loader2, ExternalLink, Paperclip, Image as ImageIcon } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data";
import type { Feedback } from "@/lib/data";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-purple-100 text-purple-700",
  under_review: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Feedback[]>([]);
  const [filtered, setFiltered] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [upvoting, setUpvoting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.data);
        setFiltered(data.data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let list = [...issues];
    if (deptFilter) list = list.filter((i) => i.department === deptFilter);
    if (statusFilter) list = list.filter((i) => i.status === statusFilter);
    if (searchQuery) list = list.filter((i) =>
      i.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    list.sort((a, b) => b.upvotes - a.upvotes);
    setFiltered(list);
  }, [deptFilter, statusFilter, searchQuery, issues]);

  const handleUpvote = async (id: string) => {
    setUpvoting(id);
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "upvote" }),
      });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.map((i) => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
      }
    } finally {
      setUpvoting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Community Issues</h1>
            <p className="text-slate-500 mt-1">Real feedback from citizens across India. Upvote to amplify.</p>
          </div>
          <Link
            href="/submit"
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            + Submit Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={16} />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">🔍</div>
            <div className="font-semibold text-lg">No issues found</div>
            <div className="text-sm mt-2">Try adjusting your filters or search</div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((issue) => {
            const dept = DEPARTMENTS.find((d) => d.id === issue.department);
            return (
              <div key={issue.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Upvote */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleUpvote(issue.id)}
                      disabled={upvoting === issue.id}
                      className="w-12 h-12 rounded-xl border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 flex flex-col items-center justify-center transition-all group disabled:opacity-50"
                    >
                      {upvoting === issue.id ? (
                        <Loader2 size={14} className="animate-spin text-orange-500" />
                      ) : (
                        <ThumbsUp size={16} className="text-slate-400 group-hover:text-orange-500" />
                      )}
                      <span className="text-xs font-bold text-slate-600 group-hover:text-orange-600">{issue.upvotes}</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {dept && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dept.color}`}>
                          {dept.icon} {dept.name}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_COLORS[issue.priority]}`}>
                        {issue.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[issue.status]}`}>
                        {issue.status.replace("_", " ").toUpperCase()}
                      </span>
                      {issue.attachments && issue.attachments.length > 0 && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                          {issue.attachments.some(a => a.type === "image") ? <ImageIcon size={12} /> : <Paperclip size={12} />}
                          {issue.attachments.length} attachment{issue.attachments.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1 truncate">{issue.subject}</h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{issue.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {issue.district ? `${issue.district}, ` : ""}{issue.state} – {issue.pincode}
                      </span>
                      <span>MP: <strong className="text-slate-600">{issue.mp}</strong></span>
                      <span>MLA: <strong className="text-slate-600">{issue.mla}</strong></span>
                    </div>
                  </div>

                  {/* Track link */}
                  <div className="shrink-0">
                    <Link
                      href={`/track?id=${issue.ticketId}`}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      {issue.ticketId}
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="text-center mt-6 text-sm text-slate-500">
            Showing {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
