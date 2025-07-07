"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  // ユーザーの入力値のための状態変数定義
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用
  const router = useRouter(); // useRouterフックの初期化

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // エラーメッセージをクリア

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/schedule"); // 成功したらスケジュールページへ
    } catch (err: any) {
      console.log("ログインエラー:", err);
      if (err.code === 'auth/wrong-password') {
        setError('パスワードが間違っています。')
      } else if (err.code === 'auth/user-not-found') {
        setError('ユーザーが見つかりません。');
      } else if (err.code === 'auth/user-disabled') {
        setError('このアカウントは無効化されています。')
      } else {
        setError('ログイン中に予期せぬエラーが発生しました。もう一度お試しください。');
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-xl max-w-sm w-full bg-white"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          ログイン
        </h2>
        <div>
          <h2 className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="メールアドレスを入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <h2 className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="パスワードを入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            ログイン
          </button>
        </div>
        {/* エラーメッセージがあれば表示 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <p className="text-center text-sm text-gray-600 mt-4">
            アカウントをお持ちでないですか？
            <a
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              新規登録
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
