"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { DEPARTMENTS, GOV_SCHEMES } from "@/lib/data";
import { ExternalLink, Phone, Globe, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Portal {
  dept: string;
  name: string;
  url: string;
  griefanceUrl: string;
  schemes: string[];
  contacts: string[];
}

export default function DepartmentsPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scrape")
      .then((r) => r.json())
      .then((data) => {
        setPortals(data.portals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Government Departments</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            All feedback is forwarded to the relevant ministry. Below are the official portals, schemes, and contact details.
          </p>
        </div>

        {/* CPGRAMS Banner */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <div className="font-bold text-lg mb-1">CPGRAMS – Official Government Grievance Portal</div>
            <div className="text-blue-100 text-sm">Centralised Public Grievance Redress & Monitoring System – used by all Central Ministries</div>
          </div>
          <a
            href="https://pgportal.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            Visit Portal <ExternalLink size={16} />
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept) => {
              const portal = portals.find((p) => p.dept === dept.id);
              const schemes = GOV_SCHEMES.filter((s) => s.dept === dept.id);
              const isOpen = selected === dept.id;

              return (
                <div
                  key={dept.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${isOpen ? "border-blue-300 shadow-md" : "border-slate-100 hover:shadow-sm"}`}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setSelected(isOpen ? null : dept.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{dept.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{dept.name}</div>
                        {portal && <div className="text-xs text-slate-500 mt-0.5">{portal.name}</div>}
                      </div>
                      <span className={`text-xs font-medium transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
                    </div>

                    {portal && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {portal.schemes.slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {portal.schemes.length > 2 && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{portal.schemes.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded content */}
                  {isOpen && portal && (
                    <div className="border-t border-slate-100 p-5 space-y-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">All Schemes</div>
                        <div className="flex flex-wrap gap-2">
                          {portal.schemes.map((s) => (
                            <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Contact & Helpline</div>
                        <div className="space-y-1">
                          {portal.contacts.map((c) => (
                            <div key={c} className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone size={12} className="text-slate-400" />
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={portal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <Globe size={12} /> Official Portal
                        </a>
                        <a
                          href={portal.griefanceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <ExternalLink size={12} /> File Grievance
                        </a>
                      </div>
                      <Link
                        href={`/submit?dept=${dept.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Submit Feedback for {dept.name}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}

                  {isOpen && !portal && (
                    <div className="border-t border-slate-100 p-5">
                      <Link
                        href={`/submit?dept=${dept.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Submit Feedback
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Gov schemes from data */}
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Key Government Schemes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOV_SCHEMES.map((scheme) => {
              const dept = DEPARTMENTS.find((d) => d.id === scheme.dept);
              return (
                <a
                  key={scheme.name}
                  href={scheme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{scheme.name}</div>
                      <div className="text-sm text-slate-500 mt-1">{scheme.description}</div>
                      {dept && <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{dept.icon} {dept.name}</span>}
                    </div>
                    <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
