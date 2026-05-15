"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, CheckCircle, Clock, Loader2, AlertCircle, MapPin, ExternalLink, Image as ImageIcon, Video, Paperclip, FileText } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data";
import type { Feedback } from "@/lib/data";

const statusSteps = [
  { key: "submitted", label: "Submitted", desc: "Feedback received" },
  { key: "under_review", label: "Under Review", desc: "Being reviewed by officials" },
  { key: "in_progress", label: "In Progress", desc: "Action being taken" },
  { key: "resolved", label: "Resolved", desc: "Issue addressed" },
];

const statusOrder = ["submitted", "under_review", "in_progress", "resolved", "closed"];

function TrackPageInner() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [ticketInput, setTicketInput] = useState(initialId);
  const [result, setResult] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialId) handleSearch(initialId);
  }, []);

  const handleSearch = async (id?: string) => {
    const query = id || ticketInput;
    if (!query.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      const found = data.data.find(
        (f: Feedback) =>
          f.ticketId.toLowerCase() === query.toLowerCase() ||
          f.id === query
      );
      if (found) setResult(found);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const dept = result ? DEPARTMENTS.find((d) => d.id === result.department) : null;
  const currentStep = result ? statusOrder.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Track Your Complaint</h1>
          <p className="text-slate-500">Enter your ticket ID to check the current status of your feedback.</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Ticket ID (e.g. CFB-2024-001)"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Try sample IDs: <button className="text-blue-500 hover:underline font-mono" onClick={() => { setTicketInput("CFB-2024-001"); handleSearch("CFB-2024-001"); }}>CFB-2024-001</button>,{" "}
            <button className="text-blue-500 hover:underline font-mono" onClick={() => { setTicketInput("CFB-2024-002"); handleSearch("CFB-2024-002"); }}>CFB-2024-002</button>,{" "}
            <button className="text-blue-500 hover:underline font-mono" onClick={() => { setTicketInput("CFB-2024-003"); handleSearch("CFB-2024-003"); }}>CFB-2024-003</button>
          </p>
        </div>

        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
            <AlertCircle size={24} className="text-red-500 shrink-0" />
            <div>
              <div className="font-semibold text-red-700">Ticket Not Found</div>
              <div className="text-sm text-red-600">No complaint found with ID &quot;{ticketInput}&quot;. Please check and try again.</div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ticket ID</div>
                  <div className="text-xl font-black text-blue-700 font-mono">{result.ticketId}</div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  result.status === "resolved" ? "bg-green-100 text-green-700" :
                  result.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                  result.status === "under_review" ? "bg-yellow-100 text-yellow-700" :
                  result.status === "closed" ? "bg-slate-100 text-slate-600" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {result.status.replace("_", " ").toUpperCase()}
                </div>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mt-4">{result.subject}</h2>
              <div className="flex flex-wrap gap-3 mt-3">
                {dept && <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{dept.icon} {dept.name}</span>}
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  result.priority === "critical" ? "bg-red-100 text-red-700" :
                  result.priority === "high" ? "bg-orange-100 text-orange-700" :
                  result.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {result.priority.toUpperCase()} PRIORITY
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin size={12} />
                  {result.pincode}, {result.state}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-6">Status Timeline</h3>
              <div className="space-y-0">
                {statusSteps.map((s, i) => {
                  const isDone = statusOrder.indexOf(s.key) <= currentStep;
                  const isCurrent = s.key === result.status;
                  return (
                    <div key={s.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-slate-200"}`}>
                          {isDone ? <CheckCircle size={16} className="text-white" /> : <Clock size={16} className={isCurrent ? "text-white" : "text-slate-400"} />}
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-10 mt-1 ${isDone ? "bg-green-300" : "bg-slate-200"}`} />
                        )}
                      </div>
                      <div className="pb-8 flex-1">
                        <div className={`font-semibold ${isDone ? "text-slate-800" : "text-slate-400"}`}>{s.label}</div>
                        <div className={`text-sm ${isDone ? "text-slate-500" : "text-slate-300"}`}>{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Issue Description</h3>
              <p className="text-slate-600 leading-relaxed mb-6">{result.description}</p>

              {result.attachments && result.attachments.length > 0 && (
                <>
                  <h3 className="font-bold text-slate-800 mb-4">Attachments ({result.attachments.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {result.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        {att.type === "image" ? (
                          <>
                            <img src={att.url} alt={att.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <ImageIcon size={12} className="text-blue-500" />
                              <span className="truncate">{att.name}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-20">
                            {att.type === "video" ? <Video size={24} className="text-purple-500 mb-1" /> :
                             att.type === "audio" ? <FileText size={24} className="text-green-500 mb-1" /> :
                             <Paperclip size={24} className="text-slate-400 mb-1" />}
                            <span className="text-xs text-slate-500 text-center truncate w-full px-1">{att.name}</span>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </>
              )}

              <h3 className="font-bold text-slate-800 mb-4">Representatives Notified</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">MP</div>
                  <div className="font-bold text-slate-800 text-sm">{result.mp}</div>
                  <div className="text-xs text-slate-500">{result.constituency}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">MLA</div>
                  <div className="font-bold text-slate-800 text-sm">{result.mla}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Local Body</div>
                  <div className="font-bold text-slate-800 text-sm">{result.localBody}</div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
              <div className="font-semibold mb-2">Not satisfied? Escalate your complaint:</div>
              <div className="flex flex-wrap gap-3">
                <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                  PG Portal <ExternalLink size={12} />
                </a>
                <a href="https://cpgrams.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                  CPGRAMS <ExternalLink size={12} />
                </a>
                <a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                  MyGov India <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
      <TrackPageInner />
    </Suspense>
  );
}
