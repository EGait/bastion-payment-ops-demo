import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bastion Payment Ops — Reconciliation & Exceptions",
  description:
    "Payment operations dashboard demo: daily recon breaks, live exceptions queue, and cross-partner diagnostic trails.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-surface-canvas text-text-primary antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
