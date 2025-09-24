// スケジュールページ
"use client";

import { useEffect, useState, useCallback } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import StreamCard from "@/components/schedule/StreamCard";
import { supabase } from "@/app/api/supabase";
import { User } from "@supabase/supabase-js";

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
  channelIconUrl: string;
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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoadingUser(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getStreamsFromRegisteredChannels = useCallback(
    async (currentUser: User) => {
      setLoadingStreams(true);
      setError(null);

      try {
        const { data: channels, error: dbError } = await supabase
          .from("channels")
          .select("id, platform, thumbnailUrl, channelName")
          .eq("user_id", currentUser.id);

        if (dbError) throw dbError;

        if (channels.length === 0) {
          setStreams([]);
          setLoadingStreams(false);
          return;
        }

        const youtubeChannelIds: string[] = [];
        const twitchChannelIds: string[] = [];
        const channelDataMap: {
          [key: string]: { channelName: string; thumbnailUrl: string };
        } = {};

        channels.forEach((channel) => {
          channelDataMap[channel.id] = {
            channelName: channel.channelName,
            thumbnailUrl: channel.thumbnailUrl,
          };
          if (channel.platform === "youtube") {
            youtubeChannelIds.push(channel.id);
          } else {
            twitchChannelIds.push(channel.id);
          }
        });

        // 新しく作成した内部APIにリクエストを送信
        const response = await fetch("/api/get-streams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtubeChannelIds,
            twitchChannelIds,
            channelDataMap,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "配信データの取得に失敗しました。"
          );
        }

        const allFetchedStreams = await response.json();
        setStreams(allFetchedStreams);
      } catch (err) {
        console.error("配信取得に失敗しました", err);
        if (err instanceof Error) {
          setError(err.message || "配信取得に失敗しました");
        } else {
          setError("配信取得に失敗しました");
        }
      } finally {
        setLoadingStreams(false);
      }
    },
    []
  );

  useEffect(() => {
    if (loadingUser) return;
    if (user) {
      getStreamsFromRegisteredChannels(user);
    } else {
      setLoadingStreams(false);
      setStreams([]);
    }
  }, [loadingUser, user, getStreamsFromRegisteredChannels]);

  const filteredStreams = streams.filter((stream) => {
    if (activeTab === "アーカイブ") return stream.status === "ended";
    if (activeTab === "配信中") return stream.status === "live";
    if (activeTab === "配信予定") return stream.status === "upcoming";
    return false;
  });

  const isLoading = loadingUser || loadingStreams;

  const sortedStreams = [...filteredStreams].sort((a, b) => {
    const dateA = new Date(a.dateTime).getTime();
    const dateB = new Date(b.dateTime).getTime();
    return activeTab === "アーカイブ" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        スケジュール
      </h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex justify-center gap-4">
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
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>配信データを読み込み中...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 dark:text-red-300 mb-4">
          <p>エラー: {error}</p>
        </div>
      )}
      {!isLoading && !error && sortedStreams.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
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
              dateTime={new Date(stream.dateTime).toLocaleString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              status={stream.status}
              streamUrl={stream.streamUrl}
              platform={stream.platform}
              channelIconUrl={stream.channelIconUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
