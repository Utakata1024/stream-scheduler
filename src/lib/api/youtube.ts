// YouTube Data APIのベースURL
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YoutubeStreamData {
  thumbnailUrl: string;
  title: string;
  channelName: string;
  dateTime: string;
  status: "live" | "upcoming" | "ended";
  streamUrl: string;
  videoId: string; // YouTube APIから取得する動画ID
}

export interface YoutubeChannelData {
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
}

/**
 * 指定されたチャンネルのライブ配信と今後の配信（プレミア公開など）を取得する関数
 * @param channelId 取得したいYouTubeチャンネルのID
 * @param apiKey YouTube Data APIキー
 * @returns ライブ配信と今後の配信のリスト
 */

export async function fetchLiveAndUpcomingStreams(
  channelId: string,
  apiKey: string
): Promise<YoutubeStreamData[]> {
  if (!apiKey) {
    console.error("APIキーが設定されていません。");
    return [];
  }

  const streams: YoutubeStreamData[] = [];

  try {
    // ライブ配信の動画ID検索
    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=id&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}`;
    console.log("Fetching YouTube API for live streams:", searchUrl);

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log("ライブ配信が見つかりませんでした。");
      return [];
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

    // 取得した動画IDを使って、詳細情報を取得
    const videosUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;
    console.log("Fetching YouTube API for stream details:", videosUrl);

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    console.log("Videos data:", videosData);

    if (videosData.items) {
      videosData.items.forEach((item: any) => {
        const liveDetails = item.liveStreamingDetails;
        
        // liveStreamingDetailsが存在しない場合は動画ではないと判断
        if (!liveDetails) {
          return;
        }

        let status: "live" | "upcoming" | "ended" = "ended";
        let dateTime = item.snippet.publishedAt; // デフォルトは公開日時

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
            item.snippet.thumbnails.high?.url || // high品質を優先
            item.snippet.thumbnails.medium?.url || // medium品質を次に
            item.snippet.thumbnails.default?.url || // default品質を最後に
            "",
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          dateTime: new Date(dateTime).toLocaleDateString("ja-JP"),
          status: status,
          streamUrl: `https://www.youtube.com/watch?v=${item.id}`,
        });
      });
    }
  } catch (error) {
    console.error("ライブ配信の取得に失敗しました:", error);
  }

  // 取得した配信を日時でソート(降順)
  streams.sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  return streams;
}

/**
 * 指定されたチャンネルの情報を取得する関数
 * @param channelId 取得したいYouTubeチャンネルのID
 * @param apiKey YouTube Data APIキー
 * @returns チャンネル情報
 */

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
      const item = data.items[0]; // 最初のアイテムが該当チャンネルの情報
      return {
        channelId: item.id,
        channelName: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.default?.url || '',
      };
    } else {
      // チャンネルが見つからない場合
      return null;
    }
  } catch (error) {
    console.error(`チャンネルID ${channelId} の詳細取得に失敗しました:`, error);
    return null;
  }
}