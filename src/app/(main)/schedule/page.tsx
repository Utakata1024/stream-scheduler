// スケジュールページ
"use client";

import { useEffect, useState } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import StreamCard from "@/components/schedule/StreamCard";
import { fetchLiveAndUpcomingStreams, YoutubeStreamData } from "@/lib/api/youtube";

export default function SchedulePage() {
  // アクティブなタブの状態管理
  const [activeTab, setActiveTab] = useState("直近");
  const [streams, setStreams] = useState<YoutubeStreamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // タブがクリックされたときの処理
  const handleTabClick = (label: string) => {
    setActiveTab(label); // クリックされたボタンがアクティブに
    // TODO: 将来的に、このactiveTabの値に応じて表示する配信データを切り替えるロジックをここに実装します
  };

  // コンポーネントがマウントされたときにAPIからデータを取得
  useEffect(() => {
    const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    const TEST_CHANNEL_ID = 'UCvUc0m317LWTTPZoBQV479A'; // テスト用のYouTubeチャンネルID

    if (!YOUTUBE_API_KEY) {
      setError("YouTube APIキーが設定されていません。'.env.local'を確認してください。");
      setLoading(false);
      return;
    }

    const getStreams = async () => {
      setLoading(true); // ロード開始
      setError(null); // エラーをリセット
      try {
        const fetchedStreams = await fetchLiveAndUpcomingStreams(
          TEST_CHANNEL_ID,
          YOUTUBE_API_KEY
        );
        setStreams(fetchedStreams); // 取得した配信データをセット
      } catch (err) {
        console.error("配信データの取得に失敗しました:", err);
        setError("配信データの取得に失敗しました。");
      } finally {
        setLoading(false); // ロード終了
      }
    };

    getStreams(); // 関数を実行してデータを取得
  }, []); // useEffectの依存配列は空なので、コンポーネントの初回マウント時にのみ実行される

  // activeTabに応じて表示する配信データをフィルタリング
  const filteredStreams = streams.filter((stream) => {
    if (activeTab === "直近") {
      // ライブと今後の配信を全て表示
      // 現在のAPI呼び出しでは、正確な「終了済み」のライブ配信の判別困難
      // より厳密な「直近」の実装には、API呼び出しの工夫やバックエンドでのデータ管理が必要
      return true;
    } else if (activeTab === "現在配信中") {
      return stream.status === "live"; // 現在配信中の配信
    } else if (activeTab === "今後") {
      return stream.status === "upcoming"; // 今後の配信
    }
    return false; // その他のタブは表示しない
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        スケジュール
      </h1>
      {/* タブ切り替えボタン */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-center gap-4">
        {["直近", "現在配信中", "今後"].map((label, index) => (
          <ToggleButton
            key={label}
            label={label}
            isActive={activeTab === label}
            onClick={() => handleTabClick(label)}
          />
        ))}
      </div>

      {/* ローディング中の表示 */}
      {loading && (
        <div className="text-center text-gray-500">
          <p>配信データを読み込み中...</p>
        </div>
      )}

      {/* エラーが発生した場合の表示 */}
      {error && (
        <div className="text-center text-red-500 mb-4">
          <p>エラー: {error}</p>  
        </div>
      )}

      {/* 配信データがない場合の表示 */}
      {!loading && !error && filteredStreams.length === 0 && (
        <div className="text-center text-gray-500">
          <p>現在、表示可能な配信はありません。</p>
        </div>
      )}

      {/* 配信カードの表示 */}
      { !loading && !error && filteredStreams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStreams.map((stream) => (
          <StreamCard
            key={stream.videoId} // 実際は配信IDなどユニークな値を使うべきですが、今回は仮にindex
            thumbnailUrl={stream.thumbnailUrl}
            title={stream.title}
            channelName={stream.channelName}
            dateTime={stream.dateTime}
            status={stream.status}
            streamUrl={stream.streamUrl}
          />
        ))}
      </div>
      )}
    </div>
  );
}