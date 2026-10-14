import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Portkey — AI活用実績を証明する",
  description: "AI活用実績を可視化・共有できるポートフォリオプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenKaku.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
