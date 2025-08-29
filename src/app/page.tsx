// トップページ

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RootPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  
  // 認証状態の監視
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 初回ロード時の認証状態を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 認証状態に応じてリダイレクト
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/schedule');
      } else {
        router.push('/login');
      }
    }
  }, [loading, user]);

  // 認証状態のロード中は何もしない（またはローディング表示）
  // ユーザー情報が取得されるまで、一時的なメッセージを表示
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-xl">認証状態を確認中...</div>;
  }

  return null;
}