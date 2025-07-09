// チャンネル管理ページ

"use client";

import { useState } from "react";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<string[]>([]); // 登録済みチャンネルIDのリスト
  const [newChannelId, setNewChannelId] = useState<string>(""); // 新規チャンネルID入力用

  // チャンネルIDを追加する関数
  const handleAddChannel = () => {
    // 入力値のトリミングと空チェック
    if (newChannelId.trim() === "") {
      alert("チャンネルIDを入力してください。");
      return;
    }
    // 登録済みでないかチェック
    if (channels.includes(newChannelId.trim())) {
      alert("このチャンネルIDは既に登録されています。");
      setNewChannelId(""); // 入力フィールドのクリア
      return;
    }
    // 新しいチャンネルIDを追加
    setChannels([...channels, newChannelId.trim()]);
    setNewChannelId(""); // 入力フィールドのクリア
  };

  // チャンネルIDを削除する関数
  const handleDeleteChannel = (channelIdToDelete: string) => {
    // 削除の確認
    if (confirm(`チャンネルID "${channelIdToDelete}" を削除しますか？`)) {
      // 削除対象を除いて新しくリスト作成
      setChannels(
        channels.filter((channelId) => channelId !== channelIdToDelete)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">チャンネル管理</h1>

      {/* チャンネルID入力フォーム */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          チャンネルを追加
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            placeholder="チャンネルIDを入力"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddChannel}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            追加
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">
          ※チャンネルIDはYouTubeチャンネルのURLから取得できます。
          (例:`youtube.com/channel/`**`UC...`**)
        </p>
      </div>

      {/* 登録済みチャンネルIDのリスト */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          登録済みチャンネル
        </h2>
        {channels.length === 0 ? (
          <p className="ext-center text-gray-600">
            まだ登録されたチャンネルはありません。
          </p>
        ) : (
          <ul className="space-y-3">
            {channels.map((channelId) => (
              <li
                key={channelId}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200"
              >
                <span className="font-medium text-gray-800 break-all">
                  {channelId}
                </span>
                <button
                  onClick={() => handleDeleteChannel(channelId)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
