import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dashboard Platform",
  description: "Upload data, describe your goal, get an AI-generated analytics dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
