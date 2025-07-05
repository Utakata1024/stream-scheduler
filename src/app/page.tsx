// トップページ
// 認証状態に応じてリダイレクト処理

import { redirect } from 'next/navigation';

export default function RootPage() {
  // 認証状態をチェック
  // 後で作る
  
  const isAuthenticated = false; // 仮で設定

  if (isAuthenticated) {
    redirect('/schedule'); // 認証済み→スケジュールページへ
  } else {
    redirect('/login'); // 未認証→ログインページへ
  }

  return null; // リダイレクトなので何もなし
}