import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear(); // 現在の年を動的に取得

  return (
    <footer className="bg-gray-800 text-white p-8 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        {/* 左側 */}
        <div className="text-center md:text-left">
          <Link href="/" className="text-2xl font-bold hover:text-gray-300">
            Stream Scheduler
          </Link>
          <p className="text-sm mt-2">
            &copy; {currentYear} Stream Scheduler. All rights reserved.
          </p>
        </div>
        {/* 右側 */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-3">情報</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="hover:text-gray-300 transition-colors duration-200"
              >
                利用規約
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-gray-300 transition-colors duration-200"
              >
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-gray-300 transition-colors duration-200"
              >
                お問い合わせ
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
