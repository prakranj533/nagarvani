import Navbar from "@/components/Navbar";
import { Shield, Users, TrendingUp, ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";

const govLinks = [
  { name: "PG Portal (CPGRAMS)", url: "https://pgportal.gov.in", desc: "Official Central Government Grievance Portal" },
  { name: "MyGov India", url: "https://mygov.in", desc: "Citizen engagement platform by GoI" },
  { name: "Find Your MLA/MP", url: "https://electoralsearch.eci.gov.in", desc: "Election Commission of India voter portal" },
  { name: "Ministry of Home Affairs", url: "https://mha.gov.in", desc: "Central government administration" },
  { name: "CPGRAMS", url: "https://cpgrams.gov.in", desc: "Grievance Redress and Monitoring System" },
  { name: "PM India Portal", url: "https://pmindia.gov.in", desc: "Prime Minister's official portal" },
];

const features = [
  { title: "Auto Representative Lookup", desc: "Enter your pincode and we instantly identify your MP, MLA and local body councillor." },
  { title: "Direct Department Routing", desc: "Feedback reaches the correct ministry – Roads, Water, Health, Education and more." },
  { title: "CPGRAMS Integration", desc: "All submissions are forwarded to the official Central Public Grievance Portal." },
  { title: "Real-time Status Tracking", desc: "Track the progress of your complaint with a unique ticket ID." },
  { title: "Community Amplification", desc: "Upvote issues to help important problems gain more attention." },
  { title: "Official Scheme Links", desc: "Access links to government schemes directly related to your feedback." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🏛️</div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4">About NagarVaani</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            NagarVaani (meaning &quot;Voice of the City&quot;) is a citizen feedback platform that bridges the gap between
            citizens and their elected representatives. We ensure every voice reaches the right government official.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-extrabold mb-4">Our Mission</h2>
          <p className="text-blue-100 leading-relaxed text-lg">
            To empower every citizen of India to hold their government representatives accountable by making it
            effortless to report issues, track responses, and connect with the right officials –
            from local councillors to Members of Parliament.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6">How We Help</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800 mb-1">{f.title}</div>
                    <div className="text-sm text-slate-500">{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Government Integration */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Government Integration</h2>
          <p className="text-slate-500 mb-6">
            NagarVaani connects directly with these official Government of India portals and resources.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {govLinks.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow group flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-blue-700 group-hover:underline">{l.name}</div>
                  <div className="text-sm text-slate-500">{l.desc}</div>
                </div>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* How representative lookup works */}
        <div className="bg-slate-800 text-white rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-extrabold mb-4">How Representative Lookup Works</h2>
          <div className="space-y-4 text-slate-300">
            <p>1. You enter your 6-digit pincode when submitting feedback.</p>
            <p>2. We match your pincode to the corresponding Lok Sabha constituency to identify your <strong className="text-white">Member of Parliament (MP)</strong>.</p>
            <p>3. We also identify your <strong className="text-white">Member of Legislative Assembly (MLA)</strong> for state-level issues.</p>
            <p>4. Your <strong className="text-white">local body councillor</strong> (Municipal/Gram Panchayat) is also tagged.</p>
            <p>5. All three officials are notified when you submit feedback in their jurisdiction.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              Verify Your Representatives <ExternalLink size={14} />
            </a>
            <a href="https://loksabha.nic.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors">
              Lok Sabha Website <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-6">
            <Users size={28} className="mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-extrabold text-slate-800">3,45,000+</div>
            <div className="text-sm text-slate-500">Citizens Engaged</div>
          </div>
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-6">
            <TrendingUp size={28} className="mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-extrabold text-slate-800">72%</div>
            <div className="text-sm text-slate-500">Response Rate</div>
          </div>
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-6">
            <Shield size={28} className="mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-extrabold text-slate-800">12</div>
            <div className="text-sm text-slate-500">Departments Covered</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-lg"
          >
            Submit Your Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
