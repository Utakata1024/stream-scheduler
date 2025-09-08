"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // パスワードの確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    // パスワードの検証
    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります。");
      return;
    }

    // 新規登録機能の実行
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) {
        throw authError;
      }
      setSuccess("登録が完了しました。確認メールを送信しました。");
      router.push("/login"); // 成功→ログインページへ
    } catch (err: any) {
      console.log("新規登録エラー:", err);
      if (err.message.includes("already registared")) {
        setError("このメールアドレスは既に登録されています。");
      } else if (err.message.includes("invalid email")) {
        setError("無効なメールアドレスです。");
      } else if (err.message.includes("Password should be at least 6 characters")) {
        setError("パスワードは6文字以上である必要があります。");
      } else {
        setError("登録中に予期せぬエラーが発生しました。もう一度お試しください。");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-xl max-w-sm w-full bg-white dark:bg-gray-800"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          新規登録
        </h2>
        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
          >
            メールアドレス
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="メールアドレスを入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400"
          >
            パスワード
          </label>
          <input
            id="signup-password"
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
          <label
            htmlFor="signup-confirm-password"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400"
          >
            パスワード確認
          </label>
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="パスワードを再入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="mt-1 text-sm text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? "非表示" : "表示"}
          </button>
        </div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full dark:bg-blue-600 dark:hover:bg-blue-500"
            type="submit"
          >
            新規登録
          </button>
        </div>
        {/* エラーメッセージがあれば表示 */}
        {error && <p className="text-red-500 text-sm text-center dark:text-red-400">{error}</p>}
        {/* 成功メッセージがあれば表示 */}
        {success && <p className="text-green-500 text-sm text-center dark:text-green-400">{success}</p>}
        <div>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-gray-400">
            すでにアカウントをお持ちですか？
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              ログイン
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
