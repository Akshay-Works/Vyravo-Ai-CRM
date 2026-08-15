import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CRMSidebar } from "@/components/CRMSidebar";
import { CRMHeader } from "@/components/CRMHeader";

export const metadata: Metadata = {
  title: {
    default: "CRM | Vyravo AI",
    template: "%s | Vyravo AI CRM",
  },
  description: "Vyravo AI CRM - Manage leads, clients, projects, and more.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-white antialiased font-[var(--font-body)]">
        <div className="min-h-screen bg-bg">
          <CRMSidebar />
          <div className="lg:pl-64">
            <CRMHeader />
            <main className="p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
