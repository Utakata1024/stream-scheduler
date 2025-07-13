'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stream Scheduler",
  description: "配信予定管理アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 認証ガード
  useEffect(() => {
    if (!loadingAuth && !user && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login");
    }
  }, [loadingAuth, user, pathname, router]);

  // ローディング表示
  if (loadingAuth || (!user && pathname !== "/login" && pathname !== "/signup")) {
    // ログインページや新規登録ページは対象外
    if (pathname !== "/login" && pathname !== "/signup") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-xl text-gray-700">認証情報を確認中...</p>
        </div>
      )
    }
  }

  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
