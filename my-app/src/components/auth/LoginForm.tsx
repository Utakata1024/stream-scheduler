"use client";

import { useState } from "react";

export default function LoginForm() {
  // ユーザーの入力値のための状態変数定義
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  // フォーム送信時の処理
  // あとで実装

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        // onSubmit={}
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-xl max-w-sm w-full bg-white"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">ログイン</h2>
        <div>
          <h2 className="blocktext-sm font-medium text-gray-700 mb-1">ユーザーID</h2>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ユーザーIDを入力"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <h2 className="block text-sm font-medium text-gray-700 mb-1">パスワード</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <div>
          <p className="text-center text-sm text-gray-600 mt-4">
            アカウントをお持ちでないですか？
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-800">
              新規登録
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
