// スケジュールページ
"use client";

import { useEffect, useState, useCallback, use } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import StreamCard from "@/components/schedule/StreamCard";
import { fetchYoutubeStreams, YoutubeStreamData } from "@/lib/api/youtube";
import { fetchTwitchStreams, getAppAccessToken } from "@/lib/api/twitch";
import { supabase } from "@/lib/supabase";

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
  const [user, setUser] = useState<any | null>(null);

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

    // 初回ロード時の認証状態を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getStreamsFromRegisteredChannels = useCallback(
    async (currentUserId: string) => {
      setLoadingStreams(true);
      setError(null);
      let allFetchedStreams: StreamData[] = [];

      try {
        const { data: channels, error: dbError } = await supabase
          .from("channels")
          .select("id, platform");

        if (dbError) {
          throw dbError;
        }

        const youtubeChannelIds: string[] = [];
        const twitchChannelIds: string[] = [];
        channels.forEach((channel: any) => {
          if (channel.platform === "youtube") {
            youtubeChannelIds.push(channel.id);
          } else {
            twitchChannelIds.push(channel.id);
          }
        });

        if (youtubeChannelIds.length === 0 && twitchChannelIds.length === 0) {
          setStreams([]);
          setLoadingStreams(false);
          return;
        }

        const fetchPromises: Promise<any>[] = [];

        // APIキー
        const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
        const TWITCH_CLIENT_SECRET =
          process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET;

        if (!YOUTUBE_API_KEY) {
          setError("YouTube APIキーが設定されていません");
          setLoadingStreams(false);
          return;
        }
        if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
          setError("Twitch APIキーが設定されていません");
          setLoadingStreams(false);
          return;
        }

        // Twitch App Access Tokenを取得し、Twitch APIを呼び出し
        if (twitchChannelIds.length > 0) {
          const twitchAccessToken = await getAppAccessToken(
            TWITCH_CLIENT_ID,
            TWITCH_CLIENT_SECRET
          );
          if (twitchAccessToken) {
            fetchPromises.push(
              fetchTwitchStreams(
                twitchChannelIds,
                twitchAccessToken,
                TWITCH_CLIENT_ID
              ).then((twitchStreams) =>
                twitchStreams.map((s) => ({
                  thumbnailUrl: s.thumbnail_url
                    .replace("{width}", "480")
                    .replace("{height}", "270"),
                  title: s.title,
                  channelName: s.user_name,
                  dateTime: s.started_at,
                  status: "live",
                  streamUrl: `https://www.twitch.tv/${s.user_name}`,
                  videoId: s.id,
                  platform: "twitch",
                }))
              )
            );
          } else {
            setError("Twitch認証トークンの取得に失敗しました。");
          }
        }

        // YouTube API呼び出し
        if (youtubeChannelIds.length > 0) {
          youtubeChannelIds.forEach((channelId) => {
            fetchPromises.push(
              fetchYoutubeStreams(channelId, YOUTUBE_API_KEY).then(
                (youtubeStreams) =>
                  youtubeStreams.map((s) => ({
                    thumbnailUrl: s.thumbnailUrl,
                    title: s.title,
                    channelName: s.channelName,
                    dateTime: s.dateTime,
                    status: s.status,
                    streamUrl: s.streamUrl,
                    videoId: s.videoId,
                    platform: "youtube",
                  }))
              )
            );
          });
        }

        const results = await Promise.allSettled(fetchPromises);

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            allFetchedStreams = allFetchedStreams.concat(result.value);
          }
        });
        setStreams(allFetchedStreams);
      } catch (err: any) {
        console.error("配信取得に失敗しました", err);
        setError(err.message || "配信取得に失敗しました");
      } finally {
        setLoadingStreams(false);
      }
    },
    []
  );

  useEffect(() => {
    if (loadingUser || !user) {
      setLoadingStreams(false);
      setStreams([]);
      return;
    }

    getStreamsFromRegisteredChannels(user.id);
  }, [loadingUser, user, getStreamsFromRegisteredChannels]);

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
