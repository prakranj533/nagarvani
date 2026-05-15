"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Flag, Bell } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "📰 Local News" },
  { href: "/aggregated-news", label: "🌐 All News" },
  { href: "/submit", label: "Submit Feedback" },
  { href: "/track", label: "Track Status" },
  { href: "/issues", label: "Community Issues" },
  { href: "/departments", label: "Departments" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <div className="bg-blue-600 text-white rounded-lg p-1.5">
              <Flag size={18} />
            </div>
            NagarVaani
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">Citizen Feedback Portal</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className="ml-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Submit Feedback
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="block mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg text-center"
            onClick={() => setOpen(false)}
          >
            + Submit Feedback
          </Link>
        </div>
      )}
    </nav>
  );
}
