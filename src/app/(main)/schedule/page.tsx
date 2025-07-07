// スケジュールページ
"use client";

import { useState } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import StreamCard from "@/components/schedule/StreamCard";

export default function SchedulePage() {
  // アクティブなタブの状態管理
  const [activeTab, setActiveTab] = useState("現在配信中");

  // ダミーデータ(後でYouTube APIから取得したデータに
  const dummyStreams = [
      {
        thumbnailUrl: "https://placehold.co/480x270/FF0000/FFFFFF?text=LIVE+1",
        title: "dummy1",
        channelName: "dummyChannel1",
        time: "2025/07/07 20:00 - 22:00",
        status: "live" as const,
        streamUrl: "https://www.youtube.com/watch?v=dummy_live_stream1"
      },
      {
        thumbnailUrl: "https://placehold.co/480x270/FF0000/FFFFFF?text=LIVE+1",
        title: "dummy2",
        channelName: "dummyChannel2",
        time: "2025/07/07 20:00 - 22:00",
        status: "upcoming" as const,
        streamUrl: "https://www.youtube.com/watch?v=dummy_live_stream2"
      }
  ];

  const handleTabClick = (label: string) => {
    setActiveTab(label); // クリックされたボタンがアクティブに
    // TODO: 将来的に、このactiveTabの値に応じて表示する配信データを切り替えるロジックをここに実装します
  };
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 配信カード */}
        {dummyStreams.map((stream, index) => (
          <StreamCard
            key={index} // 実際は配信IDなどユニークな値を使うべきですが、今回は仮にindex
            thumbnailUrl={stream.thumbnailUrl}
            title={stream.title}
            channelName={stream.channelName}
            time={stream.time}
            status={stream.status}
            streamUrl={stream.streamUrl}
          />
        ))}
      </div>
    </div>
  );
}