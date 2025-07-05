# Stream Scheduler

登録した YouTube チャンネルの配信予定を表示する Web アプリケーション

ホロライブプロダクションの「ホロジュール」のようなもの　https://schedule.hololive.tv/

## 実装したい機能

### 最低限欲しい機能

*認証機能
  *ユーザー登録
  *ID とパスワードによるログイン
  *認証状態に応じたリダイレクト
  *ログイン状態の維持とログアウト

*チャンネル管理機能
  *チャンネルを登録・削除できる機能
  *登録チャンネルのリスト表示

*配信予定表示機能
  *YouTube APIによる情報取得
  *取得した情報の表示(サムネ、タイトル、日時、チャンネル名、状態)
  *配信カードからYouTubeへの遷移
  *タブ切り替え機能(直近、現在配信中、今後)
  *切り替えに対応した配信の表示

*UI/UX
  *サイト共通のヘッダー
  *サイト共通のフッター

### 将来的な拡張
*カレンダー形式でのスケジュール表示ページ
*フィルタリング、ソート機能
*タグ？によるグループ分け機能
*ライブ開始前の通知機能
*お気に入り機能


##技術スタック
*フロント
  *Next.js
　*React
　*TypeScript
　*Tailwind CSS

*バック
　*Firebase（多分これ）
　*YouTube API
　*Ruby on Rails（未定）


## Getting Started!!

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
