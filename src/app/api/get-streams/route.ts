import { NextResponse } from "next/server";
import { fetchYoutubeStreams } from "@/app/api/youtube";
import { fetchTwitchStreams, getAppAccessToken } from "@/app/api/twitch";
import type { TwitchStream } from "@/app/api/twitch";

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

export async function POST(request: Request) {
  try {
    const { youtubeChannelIds, twitchChannelIds, channelDataMap } =
      await request.json();

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

    if (!YOUTUBE_API_KEY || !TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      throw new Error(
        "サーバーにAPIキーまたはクライアントシークレットが設定されていません。"
      );
    }

    let allFetchedStreams: StreamData[] = [];
    const fetchPromises: Promise<StreamData[]>[] = [];

    // Twitch
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
            twitchStreams.map((s: TwitchStream) => ({
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
              channelIconUrl: channelDataMap[s.user_id]?.thumbnailUrl || "",
            }))
          )
        );
      }
    }

    // YouTube
    if (youtubeChannelIds.length > 0) {
      youtubeChannelIds.forEach((channelId: string) => {
        fetchPromises.push(
          fetchYoutubeStreams(channelId, YOUTUBE_API_KEY).then(
            (youtubeStreams) =>
              youtubeStreams.map((s) => ({
                ...s,
                platform: "youtube",
                channelIconUrl: channelDataMap[channelId]?.thumbnailUrl || "",
              }))
          )
        );
      });
    }

    const results = await Promise.allSettled(fetchPromises);
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allFetchedStreams = allFetchedStreams.concat(
          result.value as StreamData[]
        );
      } else {
        console.error("APIの取得に失敗しました:", result.reason);
      }
    });

    return NextResponse.json(allFetchedStreams);
  } catch (error) {
    console.error("[APIエラー: get-streams]", error);
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
