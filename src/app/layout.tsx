import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portkey — AIの活用実績を証明する",
  description: "AI活用実績を可視化・共有できるポートフォリオプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
