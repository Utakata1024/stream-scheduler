"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ログイン処理の実行
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        throw authError;
      }
      router.push("/schedule"); // 成功→スケジュールページへ
    } catch (err: any) {
      // エラー処理
      console.log("ログインエラー:", err);
      if (err.message.includes('invalid login credentials')) {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else if (err.message.includes('User is disabled')) {
        setError("このアカウントは無効化されています。");
      } else {
        setError("ログイン中に予期せぬエラーが発生しました。もう一度お試しください。");
      }
    }
  }

  return (
    <div className="flex bg-white dark:bg-gray-800 min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-xl max-w-sm w-full bg-white dark:bg-gray-900"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          ログイン
        </h2>
        <div>
          <h2 className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
            メールアドレス
          </h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="メールアドレスを入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <h2 className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
            パスワード
          </h2>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="パスワードを入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mt-1 text-sm text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-300"
          >
            {showPassword ? "非表示" : "表示"}
          </button>
        </div>
        <div>
          <button
            className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
            type="submit"
          >
            ログイン
          </button>
        </div>
        {/* エラーメッセージがあれば表示 */}
        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
        <div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            アカウントをお持ちでないですか？
            <a
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              新規登録
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
