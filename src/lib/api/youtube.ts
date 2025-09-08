import { timeStamp } from "console";
import { cache } from "react";

// 修正後のコード (src/lib/api/youtube.ts)
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YoutubeStreamData {
  thumbnailUrl: string;
  title: string;
  channelName: string;
  dateTime: string;
  status: "live" | "upcoming" | "ended";
  streamUrl: string;
  videoId: string;
}

export interface YoutubeChannelData {
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
}

// キャッシュ(有効期限:5分)
const youtubeCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchYoutubeStreams(
  channelId: string,
  apiKey: string
): Promise<YoutubeStreamData[]> {
  if (!channelId) {
    return [];
  }

  // キャッシュからデータを取得
  const cachedData = youtubeCache.get(channelId);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL_MS) {
    console.log(`Cache hit for YouTube channel: ${channelId}`);
    return cachedData.data;
  }

  try {
    // 1. 最新の動画を1回のsearch API呼び出しで取得
    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=id,snippet&channelId=${channelId}&type=video&order=date&maxResults=50&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const videoIds = (searchData && searchData.items)
      ? searchData.items.map((item: any) => item.id.videoId).join(",")
      : "";

    if (!videoIds) {
      return [];
    }

    // 2. 取得した動画IDの詳細情報を1回のvideos API呼び出しで取得
    const videosUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    const streams: YoutubeStreamData[] = [];

    if (videosData.items) {
      videosData.items.forEach((item: {
        liveStreamingDetails: {
          actualStartTime?: string;
          actualEndTime?: string;
          scheduledStartTime?: string;
        },
        snippet: {
          publishedAt: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
          title: string;
          channelTitle: string;
        },
        id: string
      }) => {
        const liveDetails = item.liveStreamingDetails;

        // liveStreamingDetailsが存在する動画のみをフィルタリング
        if (!liveDetails) {
          return;
        }

        let status: "live" | "upcoming" | "ended" = "ended";
        let dateTime: string = item.snippet.publishedAt;

        if (liveDetails.actualEndTime) {
          status = "ended";
          dateTime = liveDetails.actualEndTime;
        } else if (liveDetails.actualStartTime) {
          status = "live";
          dateTime = liveDetails.actualStartTime;
        } else if (liveDetails.scheduledStartTime) {
          status = "upcoming";
          dateTime = liveDetails.scheduledStartTime;
        }

        streams.push({
          videoId: item.id,
          thumbnailUrl:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url ||
            "",
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          dateTime: dateTime,
          status: status,
          streamUrl: `https://www.youtube.com/watch?v=${item.id}`,
        });
      });
    }

    // 配信日時でソート
    streams.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    // 取得したデータをキャッシュに保存
    youtubeCache.set(channelId, {
      data: streams,
      timestamp: Date.now(),
    });

    return streams;
  } catch (error) {
    console.error("動画の取得に失敗しました:", error);
    return [];
  }
}

export async function fetchChannelDetails(
  channelId: string,
  apiKey: string,
): Promise<YoutubeChannelData | null> {
  if (!apiKey) {
    console.error("APIキーが設定されていません");
    return null;
  }

  try {
    const requestUrl = `${YOUTUBE_API_BASE_URL}/channels?part=snippet&id=${channelId}&key=${apiKey}`;

    const response = await fetch(requestUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        channelId: item.id,
        channelName: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.default?.url || '',
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`チャンネルID ${channelId} の詳細取得に失敗しました:`, error);
    return null;
  }
}