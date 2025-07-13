"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header() {
  const pathname = usePathname(); // 現在のURLパスを取得
  const router = useRouter();
  const isLoginPage = pathname === "/login";

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // ログアウト後にログインページへリダイレクト
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      alert("ログアウトに失敗しました。");
    }
  };

  // ログインページの場合はヘッダーを表示しない
  if (loadingAuth) {
    return null;
  }

  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* アプリのタイトル/ロゴ */}
        <Link href="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors duration-200">
          Stream Scheduler
        </Link>

        {!isLoginPage && user ? (
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/calendar"
                  className="text-lg hover:text-indigo-200 transition-colors duration-200"
                >
                  カレンダー
                </Link>
              </li>
              <li>
                <Link
                  href="/channnels"
                  className="text-lg hover:text-indigo-200 transition-colors duration-200"
                >
                  チャンネル管理
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                >
                  ログアウト
                </button>
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
