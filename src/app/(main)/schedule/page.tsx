// スケジュールページ
"use client";

import { useEffect, useState, useCallback } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import StreamCard from "@/components/schedule/StreamCard";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// 統一されたストリームデータの型定義
interface StreamData {
  thumbnailUrl: string;
  title: string;
  channelName: string;
  dateTime: string;
  status: "live" | "upcoming" | "ended";
  streamUrl: string;
  videoId: string;
  platform: "youtube" | "twitch";
}

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("アーカイブ");
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const handleTabClick = (label: string) => {
    setActiveTab(label);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const getStreamsFromRegisteredChannels = useCallback(async () => {
    setLoadingStreams(true);
    setError(null);

    if (!user) {
      setStreams([]);
      setLoadingStreams(false);
      return;
    }

    try {
      // GoバックエンドのAPIを呼び出す
      // fetchのURLはGoサーバーのアドレスとポートに合わせる
      const response = await fetch(
        `http://localhost:8080/api/streams?uid=${user.uid}`
      );

      if (response.ok) {
        throw new Error("GoバックエンドのAPIからのデータ取得に失敗しました");
      }

      const data = await response.json();
      setStreams(data);
    } catch (err: any) {
      console.error("配信取得に失敗しました:", err);
      setError(err.message || "配信データの取得中にエラーが発生しました");
    } finally {
      setLoadingStreams(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loadingUser && user) {
      getStreamsFromRegisteredChannels();
    }
    if (!loadingUser && !user) {
      setLoadingStreams(false);
    }
  }, [user, loadingUser, getStreamsFromRegisteredChannels]);

  const filteredStreams = streams.filter((stream) => {
    if (activeTab === "アーカイブ") {
      return stream.status === "ended";
    } else if (activeTab === "配信中") {
      return stream.status === "live";
    } else if (activeTab === "配信予定") {
      return stream.status === "upcoming";
    }
    return false;
  });

  const isLoading = loadingUser || loadingStreams;

  const sortedStreams = [...filteredStreams];
  if (activeTab === "アーカイブ") {
    sortedStreams.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
  } else {
    sortedStreams.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">スケジュール</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-center gap-4">
        {["アーカイブ", "配信中", "配信予定"].map((label) => (
          <ToggleButton
            key={label}
            label={label}
            isActive={activeTab === label}
            onClick={() => handleTabClick(label)}
          />
        ))}
      </div>
      {isLoading && (
        <div className="text-center text-gray-500">
          <p>配信データを読み込み中...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 mb-4">
          <p>エラー: {error}</p>
        </div>
      )}
      {!isLoading && !error && sortedStreams.length === 0 && (
        <div className="text-center text-gray-500">
          <p>現在、表示可能な配信はありません。</p>
        </div>
      )}
      {!isLoading && !error && sortedStreams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStreams.map((stream) => (
            <StreamCard
              key={stream.videoId}
              thumbnailUrl={stream.thumbnailUrl}
              title={stream.title}
              channelName={stream.channelName}
              dateTime={new Date(stream.dateTime).toLocaleString("ja-JP")}
              status={stream.status}
              streamUrl={stream.streamUrl}
              platform={stream.platform}
            />
          ))}
        </div>
      )}
    </div>
  );
}
