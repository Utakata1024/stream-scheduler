"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname(); // 現在のURLパスを取得

  // ログイン画面かどうかの判定
  const isLoginPage = pathname === "/login";

  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* アプリのタイトル/ロゴ */}
        <Link href="/">Stream Scheduler</Link>

        {!isLoginPage && (
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/schedule" className="text-lg hover:text-indigo-200 transition-colors duration-200">
                    スケジュール
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-lg hover:text-indigo-200 transition-colors duration-200">
                    設定
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
