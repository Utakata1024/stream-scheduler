"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import firebase from "firebase/compat/app";
import { FirebaseError } from "firebase/app";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // パスワードの確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    // 新規登録機能の実行
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/schedule"); // 成功→スケジュールページへ
    } catch (err: unknown) {
      // エラー処理
      console.log("新規登録エラー:", err);
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("このメールアドレスはすでに使用されています。");
        } else if (err.code === "auth/invalid-email") {
          setError("無効なメールアドレスです。");
        } else if (err.code === "auth/weak-password") {
          setError("パスワードは6文字以上である必要があります。");
        } else {
          setError(
            "新規登録中に予期せぬエラーが発生しました。もう一度お試しください。"
          );
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-xl max-w-sm w-full bg-white"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          新規登録
        </h2>
        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "非表示" : "表示"}
          </button>
        </div>
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "非表示" : "表示"}
          </button>
        </div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            新規登録
          </button>
        </div>
        {/* エラーメッセージがあれば表示 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <p className="text-center text-sm text-gray-600 mt-4">
            すでにアカウントをお持ちですか？
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              ログイン
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
