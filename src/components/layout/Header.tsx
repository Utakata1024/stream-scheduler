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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Supabaseの認証状態を監視
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoadingAuth(false);
      }
    );

    // 初回ロード時の認証状態を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ログイン・新規登録ページはヘッダーを表示しない
  // 認証状態がロード中の場合もヘッダーを表示しないようにする
  if (loadingAuth || isLoginPage || isSignUpPage) {
    return null;
  }

  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* アプリのタイトル/ロゴ */}
        <Link
          href="/"
          className="text-2xl font-bold hover:text-indigo-200 transition-colors duration-200"
        >
          Stream Scheduler
        </Link>
        {user ? (
          <>
            {/* デスクトップ用ナビゲーション */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
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
            {/* モバイル用ハンバーガーボタン */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {/* モバイル用ドロップダウンメニュー */}
            {isMenuOpen && (
              <div className="absolute top-16 left-0 w-full bg-indigo-700 p-4 shadow-md md:hidden">
                <nav>
                  <ul className="flex flex-col space-y-4">
                    <li>
                      <Link
                        href="/channels"
                        className="text-lg hover:text-indigo-200 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        チャンネル管理
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="text-lg hover:text-indigo-200 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        設定
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          !isLoginPage &&
          !user && ( // 非ログイン状態で、かつログインページ以外の場合にログインボタンを表示
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
