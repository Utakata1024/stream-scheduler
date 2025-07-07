// トップページ
// 認証状態に応じてリダイレクト処理

import { redirect } from 'next/navigation';

export default function RootPage() {
  // 開発中はログインをスキップして、直接 /schedule にリダイレクト
  // TODO: 後ほどこの行を削除し、以下の認証ロジックを有効に
  redirect('/schedule');
  
  // 実際の認証ロジック
  {/*
  const isAuthenticated = false; // 仮で設定

  if (isAuthenticated) {
    redirect('/schedule'); // 認証済み→スケジュールページへ
  } else {
    redirect('/login'); // 未認証→ログインページへ
  }

  return null; // リダイレクトなので何もなし
  */}
}