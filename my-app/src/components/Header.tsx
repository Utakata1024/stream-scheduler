import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* アプリのタイトル/ロゴ */}
        <Link href="/">Stream Scheduler</Link>

        <nav>
          <ul>
            <li>
              <Link href="/schedule">スケジュール</Link>
            </li>
            <li>
              <Link href="/settings">設定</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
