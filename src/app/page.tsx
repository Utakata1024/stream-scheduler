// トップページ
// 認証状態に応じてリダイレクト処理

'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/lib/firebase";

export default function RootPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 認証状態のロード中は何もしない（またはローディング表示）
  // ユーザー情報が取得されるまで、一時的なメッセージを表示
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-xl">認証状態を確認中...</div>;
  }

  // 認証済み→スケジュールページへ
  if (user) {
    redirect('/schedule');
  } else { // 未認証→ログインページへ
    redirect('/login')
  }

  return null;
}