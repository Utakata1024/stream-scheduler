"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          router.push("/login");
        }
        setLoading(false);
      }
    );

    // 初回ロード時の認証状態を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      alert("ログアウトに失敗しました。");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">設定</h1>
        <div className="space-y-6">
          {/* ログアウトボタン */}
          <div className="flex justify-between items-center">
            <p className="text-lg dark:text-gray-300">アカウントからログアウト</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white dark:text-gray-100 rounded-md hover:bg-red-600 dark:hover:bg-red-500 transition-colors duration-200"
            >
              ログアウト
            </button>
          </div>

          {/* その他の設定項目を追加するセクション */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              その他の設定項目はここに配置されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
