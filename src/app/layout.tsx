import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchStat",
  description: "Analyse tes performances de football, match après match.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
