import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Jharkhand Civic Connect — Issue reporting",
  description:
    "Crowdsourced civic issue reporting and resolution. Report potholes, lighting, sanitation, and track progress.",
  keywords: [
    "civic tech",
    "Jharkhand",
    "issue reporting",
    "smart city",
    "clean and green",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
