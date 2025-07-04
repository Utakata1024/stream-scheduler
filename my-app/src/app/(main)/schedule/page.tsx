// スケジュールページ
"use client";

import { useState } from "react";
import ToggleButton from "@/components/ui/ToggleButton";

export default function SchedulePage() {
  // アクティブなタブの状態管理
  const [activeTab, setActiveTab] = useState("現在配信中");

  const handleTabClick = (label: string) => {
    setActiveTab(label); // クリックされたボタンがアクティブに
    // TODO: 将来的に、このactiveTabの値に応じて表示する配信データを切り替えるロジックをここに実装します
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        直近のスケジュール
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
        {/* 配信カードを仮設置。後で実装 */}
        <div className="bg-white rounded-lg shadow-md p-4">配信カード1</div>
        <div className="bg-white rounded-lg shadow-md p-4">配信カード2</div>
        <div className="bg-white rounded-lg shadow-md p-4">配信カード3</div>
      </div>
    </div>
  );
}
