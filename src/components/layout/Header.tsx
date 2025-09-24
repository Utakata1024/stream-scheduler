"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/api/supabase";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignUpPage = pathname === "/signup";

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoadingAuth(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  if (loadingAuth || isLoginPage || isSignUpPage) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md relative z-30">
      <div className="container mx-auto flex justify-between items-center">
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
              className="md:hidden w-6 h-6 flex flex-col justify-between z-40"
              onClick={toggleMenu}
            >
              <span
                className={`block w-full h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`block w-full h-0.5 bg-white transition-opacity duration-300 ease-in-out ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-full h-0.5 bg-white transition-transform duration-300 ease-in-out ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
            {/* メニューが開いているときに表示される透明なオーバーレイ */}
            {isMenuOpen && (
              <div
                className="fixed inset-0 z-10 md:hidden"
                onClick={toggleMenu}
              ></div>
            )}
            {/* モバイル用ドロワーメニュー */}
            <div
              className={`md:hidden fixed top-0 right-0 w-1/2 h-screen bg-indigo-700 shadow-lg p-4 pt-20 transform transition-transform duration-300 ease-in-out z-20 ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <nav className="flex flex-col items-center">
                <Link
                  href="/channels"
                  className="w-full text-center py-4 text-lg hover:bg-indigo-600 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  チャンネル管理
                </Link>
                <Link
                  href="/settings"
                  className="w-full text-center py-4 text-lg hover:bg-indigo-600 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  設定
                </Link>
              </nav>
            </div>
          </>
        ) : (
          !isLoginPage &&
          !user && (
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
