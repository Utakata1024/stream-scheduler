"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 認証状態の監視
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoadingAuth(false);
      }
    );

    // 初回ロード時の認証状態確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 認証ガード
  useEffect(() => {
    // ロードが完了し、かつユーザーがいない場合、ログインページへリダイレクト
    if (
      !loadingAuth &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/signup"
    ) {
      router.push("/login");
    }
  }, [loadingAuth, user, pathname, router]);

  // ローディング表示
  // ログインページや新規登録ページの場合は、認証ガードの対象外
  if (
    loadingAuth ||
    (!user && pathname !== "/login" && pathname !== "/signup")
  ) {
    if (pathname !== "/login" && pathname !== "/signup") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-xl text-gray-700">認証情報を確認中...</p>
        </div>
      );
    }
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
