import type { Metadata } from "next";
import { M_PLUS_1p } from "next/font/google";
import "./globals.css";

const mPlus1p = M_PLUS_1p({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-m-plus-1p",
});

export const metadata: Metadata = {
  title: "Stream Scheduler",
  description: "配信予定管理アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${mPlus1p.className}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
