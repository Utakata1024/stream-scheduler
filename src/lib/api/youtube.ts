// YouTube Data APIのベースURL
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YoutubeStreamData {
  thumbnailUrl: string;
  title: string;
  channelName: string;
  dateTime: string;
  status: "live" | "upcoming" | "ended"; // APIから取得した情報で判断
  streamUrl: string;
  videoId: string; // YouTube APIから取得する動画ID
}

export interface YoutubeChannelData {
  channelId: string; // YouTubeチャンネルのID
  channelName: string; // チャンネル名
  thumbnailUrl: string; // チャンネルのサムネイルURL
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
    // ライブ配信の検索
    const requestUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=20&key=${apiKey}`;
    console.log("Fetching YouTube API from URL:", requestUrl);

    const response = await fetch(requestUrl);
    const liveData = await response.json();

    // ここでレスポンス全体をコンソールに出力して確認
    console.log("YouTube Search API Response:", liveData);

    if (liveData.items) {
      // 取得した各動画アイテムに対してループ処理
      liveData.items.forEach((item: any) => {
        // liveBroadCastContentが'upcoming'ならば今後の配信
        const liveBroadCastContent = item.snippet.liveBroadcastContent;
        let status: "live" | "upcoming" | "ended" = "ended"; // デフォルトは終了済み

        if (liveBroadCastContent === "live") {
          status = "live";
        } else if (liveBroadCastContent === "upcoming") {
          status = "upcoming";
        } else if (liveBroadCastContent === "none") {
          status = "ended"; // 予定がない場合は終了済みとする
        }

        // 各動画itemから必要な情報を抽出してstreamsに追加
        streams.push({
          videoId: item.id.videoId,
          thumbnailUrl:
            item.snippet.thumbnails.high?.url || // high品質を優先
            item.snippet.thumbnails.medium?.url || // medium品質を次に
            item.snippet.thumbnails.default?.url || // default品質を最後に
            "",
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          // 予定開始時刻は liveStreamingDetails にあることが多いが、search APIのsnippetにはpublishedAtしかない場合も
          // より正確な時刻が必要なら videos.list API を追加で叩く必要があるが、今回はpublishedAtで簡略化
          dateTime: new Date(item.snippet.publishedAt).toLocaleDateString(
            "ja-JP"
          ), // 公開日時を日本語で
          status: status,
          streamUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
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