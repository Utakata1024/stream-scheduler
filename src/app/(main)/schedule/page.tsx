// スケジュールページ
"use client";

import { useEffect, useState } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import StreamCard from "@/components/schedule/StreamCard";
import { fetchStreams, YoutubeStreamData } from "@/lib/api/youtube";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, getDocs, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { YoutubeChannelData } from "@/lib/api/youtube";

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("アーカイブ");
  const [streams, setStreams] = useState<YoutubeStreamData[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // タブがクリックされたときの処理
  const handleTabClick = (label: string) => {
    setActiveTab(label);
  };

  // ユーザーのログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // ユーザーがログインしたら登録チャンネルを取得し、その配信情報をフェッチ
  useEffect(() => {
    // ユーザー認証情報のロード中または非ログインの場合は何もしない
    if (loadingUser || !user) {
      setLoadingStreams(false);
      setStreams([]);
      return;
    }

    const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      setError("YouTube APIキーが設定されていません。");
      setLoadingStreams(false);
      return;
    }
    if (!db) {
      console.error("Firestore DB is not initialized.");
      setError("データベースが利用できません");
      setLoadingStreams(false);
      return;
    }

    // 登録チャンネルから配信情報取得
    const getStreamsFromRegisteredChannels = async () => {
      setLoadingStreams(true);
      setError(null);
      let allFetchedStreams: YoutubeStreamData[] = [];

      try {
        // Firestoreからユーザーの登録チャンネルのID取得
        const userChannelsRef = collection(db, `users/${user.uid}/channels`);
        const q = query(userChannelsRef);
        const querySnapshot = await getDocs(q);
        const registerChannelIds: string[] = [];
        querySnapshot.forEach((doc) => {
          registerChannelIds.push(doc.id);
        });

        if (registerChannelIds.length === 0) {
          // 登録チャンネルが無い場合はAPIを呼び出さない
          setStreams([]);
          setLoadingStreams(false);
          return;
        }

        // 各登録チャンネルの配信情報をYouTube APIから取得
        const fetchPromises = registerChannelIds.map(async (channelId) => {
          try {
            return await fetchStreams(channelId, YOUTUBE_API_KEY);
          } catch (apiError) {
            console.error(`チャンネル ${channelId} の配信取得に失敗しました:`, apiError);
            return [];
          }
        });

        const results = await Promise.allSettled(fetchPromises); // 失敗しても続行するために

        // 成功した結果のみを集約
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            allFetchedStreams = allFetchedStreams.concat(result.value);
          }
        });

        setStreams(allFetchedStreams);

      } catch (err) {
        console.error("登録チャンネルの配信取得に失敗しました", err);
        setError("登録チャンネルの配信取得に失敗しました");
      } finally {
        setLoadingStreams(false);
      }
    };

    getStreamsFromRegisteredChannels();
  }, [user, loadingUser, db]); // userオブジェクトとloadingUser、dbが変更されたときに再実行

  // activeTabに応じて表示する配信データをフィルタリング
  const filteredStreams = streams.filter((stream) => {
    if (activeTab === "アーカイブ") {
      return stream.status === "ended"; // アーカイブされた配信
    } else if (activeTab === "配信中") {
      return stream.status === "live"; // 現在配信中の配信
    } else if (activeTab === "配信予定") {
      return stream.status === "upcoming"; // 今後の配信
    }
    return false; // その他のタブは表示しない
  });

  // 各タブのソート順を変更
  if (activeTab === "アーカイブ") {
    // アーカイブは最新順
    filteredStreams.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
  } else {
    // 配信中と配信予定は現在時刻に近い順
    filteredStreams.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }

  const isLoading = loadingUser || loadingStreams;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">スケジュール</h1>
      {/* タブ切り替えボタン */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-center gap-4">
        {["アーカイブ", "配信中", "配信予定"].map((label, index) => (
          <ToggleButton
            key={label}
            label={label}
            isActive={activeTab === label}
            onClick={() => handleTabClick(label)}
          />
        ))}
      </div>

      {/* ローディング中の表示 */}
      {isLoading && (
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
      {!isLoading && !error && filteredStreams.length === 0 && (
        <div className="text-center text-gray-500">
          <p>現在、表示可能な配信はありません。</p>
        </div>
      )}

      {/* 配信カードの表示 */}
      {!isLoading && !error && filteredStreams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard
              key={stream.videoId}
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
