import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NagarVaani – Citizen Feedback Portal",
  description: "Send feedback directly to your MLA, MP and local government authorities. Track your complaints and hold officials accountable.",
  keywords: "citizen feedback, government, MLA, MP, grievance, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
