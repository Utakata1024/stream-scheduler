"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignUpPage = pathname === "/signup";

  const [user, setUser] = useState<any | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Supabaseの認証状態を監視
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
          setUser(session?.user ?? null);
          setUser(null);
      }
    );
    
    // 初回ロード時の認証状態を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // ログイン・新規登録ページはヘッダーを表示しない
  if (loadingAuth || isLoginPage || isSignUpPage) {
    return null;
  }

  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">

        {/* アプリのタイトル/ロゴ */}
        <Link href="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors duration-200">
          Stream Scheduler
        </Link>

        {user ? (
          <nav>
            <ul className="flex space-x-6">
              {/* <li>
                <Link
                  href="/calendar"
                  className="text-lg hover:text-indigo-200 transition-colors duration-200"
                >
                  カレンダー
                </Link>
              </li> */}
              <li>
                <Link
                  href="/channels"
                  className="text-lg hover:text-indigo-200 transition-colors duration-200"
                >
                  チャンネル管理
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-lg hover:text-indigo-200 transition-colors duration-200"
                >
                  設定
                </Link>
              </li>
            </ul>
          </nav>
        ) : (
          !isLoginPage && !user && ( // 非ログイン状態で、かつログインページ以外の場合にログインボタンを表示
            <Link
              href="/login"
              className="text-lg hover:text-indigo-200 transition-colors duration-200"
            >
              ログイン
            </Link>
          )
        )}
      </div>
    </header>
  );
}
