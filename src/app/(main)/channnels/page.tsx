// チャンネル管理ページ

"use client";

import { useState } from "react";
import { fetchChannelDetails, YoutubeChannelData } from "@/lib/api/youtube";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<YoutubeChannelData[]>([]); // 登録済みチャンネルIDのリスト
  const [newChannelId, setNewChannelId] = useState<string>(""); // 新規チャンネルID入力用
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // エラーメッセージ用
  const [successMessage, setSuccessMessage] = useState<string | null>(null); //成功メッセージ用
  const [addingChannel, setAddingChannel] = useState(false); // チャンネル追加中のローディング状態

  // チャンネルIDを追加する関数
  const handleAddChannel = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 入力値のトリミングと空チェック
    if (newChannelId.trim() === "") {
      alert("チャンネルIDを入力してください。");
      return;
    }
    // 登録済みかチェック
    const trimmedChannelId = newChannelId.trim();
    if (channels.some((c) => c.channelId === trimmedChannelId)) {
      alert("このチャンネルIDは既に登録されています。");
      setNewChannelId(""); // 入力欄クリア
      return;
    }

    setAddingChannel(true); // チャンネル追加中のローディング開始

    // YouTubeAPIキーの取得
    const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      setErrorMessage("YouTube APIキーが設定されていません");
      setAddingChannel(false);
      return;
    }

    try {
      // YouTubeAPIで詳細情報取得
      const channelDetails = await fetchChannelDetails(
        trimmedChannelId,
        YOUTUBE_API_KEY
      );

      if (!channelDetails) {
        setErrorMessage("指定されたチャンネルIDが見つかりません");
        setNewChannelId(""); // 入力欄クリア
        return;
      }
      // 新しいチャンネルを追加
      setChannels([...channels, channelDetails]);
      setNewChannelId(""); // 入力欄クリア
      setSuccessMessage("チャンネルが追加されました");
    } catch (error) {
      console.error("チャンネルの追加に失敗しました", error);
      setErrorMessage("チャンネルの追加に失敗しました");
    } finally {
      // try, catchどちらを通ってもここでローディング終了
      setAddingChannel(false);
    }
  };

  // チャンネルIDを削除する関数
  const handleDeleteChannel = (channelIdToDelete: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 削除の確認
    if (confirm(`チャンネルID "${channelIdToDelete}" を削除しますか？`)) {
      // 削除対象を除いて新しくリスト作成
      setChannels(
        channels.filter((channel) => channel.channelId !== channelIdToDelete)
      );
      setSuccessMessage("チャンネルが削除されました!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">チャンネル管理</h1>

      {/* メッセージ表示エリア */}
      {errorMessage && (
        <p className="text-center text-red-500 text-sm mt-4">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-center text-green-600 text-sm mt-4">
          {successMessage}
        </p>
      )}

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
            disabled={addingChannel} // 追加中は入力不可
          />
          <button
            onClick={handleAddChannel}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            disabled={addingChannel} // 追加中はボタン無効化
          >
            {addingChannel ? "追加中..." : "追加"} {/* ローディング表示 */}
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
          <p className="text-center text-gray-600">
            まだ登録されたチャンネルはありません。
          </p>
        ) : (
          <ul className="space-y-3">
            {channels.map((channel) => (
              <li
                key={channel.channelId}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200"
              >
                {/* チャンネル名とアイコンの表示 */}
                <div className="flex items-center gap-3">
                  {channel.thumbnailUrl && (
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.channelName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="font-medium text-gray-800 break-all">
                    {channel.channelName}
                  </span>
                  {/* デバッグ用にIDも表示 */}
                  <span className="text-gray-500 text-xs hidden sm:inline-block">
                    ({channel.channelId})
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteChannel(channel.channelId)}
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
