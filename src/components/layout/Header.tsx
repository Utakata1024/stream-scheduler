"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isSignUpPage = pathname === "/signup";

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Firebaseの認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
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
