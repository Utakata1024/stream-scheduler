// このファイルはサーバーサイドでのみ実行されます
import { NextResponse } from "next/server";
import { fetchChannelDetails as fetchYoutubeChannelDetails } from "@/app/api/youtube";
import { fetchUserByLogin, getAppAccessToken } from "@/app/api/twitch";

// 外部APIから取得したチャンネル詳細情報の型定義
interface ChannelDetails {
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
}

export async function POST(request: Request) {
  try {
    const { channelInput, platform } = await request.json();

    if (!channelInput || !platform) {
      return NextResponse.json(
        { error: "チャンネル情報またはプラットフォームが指定されていません。" },
        { status: 400 }
      );
    }

    // サーバーサイドでのみ環境変数を安全に読み込む
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

    let channelDetails: ChannelDetails | null = null;

    if (platform === "youtube") {
      if (!YOUTUBE_API_KEY)
        throw new Error("YouTube APIキーがサーバーに設定されていません");
      channelDetails = await fetchYoutubeChannelDetails(
        channelInput,
        YOUTUBE_API_KEY
      );
    } else if (platform === "twitch") {
      if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET)
        throw new Error("Twitchの認証情報がサーバーに設定されていません");

      const twitchAccessToken = await getAppAccessToken(
        TWITCH_CLIENT_ID,
        TWITCH_CLIENT_SECRET
      );
      if (!twitchAccessToken)
        throw new Error("Twitch認証トークンの取得に失敗しました。");

      const twitchUser = await fetchUserByLogin(
        channelInput,
        twitchAccessToken,
        TWITCH_CLIENT_ID
      );
      if (twitchUser) {
        channelDetails = {
          channelId: twitchUser.id,
          channelName: twitchUser.display_name,
          thumbnailUrl: twitchUser.profile_image_url,
        };
      }
    }

    if (!channelDetails) {
      return NextResponse.json(
        { error: "指定されたチャンネルが見つかりません。" },
        { status: 404 }
      );
    }

    // 成功した場合はチャンネル情報をクライアントに返す
    return NextResponse.json({ ...channelDetails, platform });
  } catch (error) {
    console.error("チャンネル追加APIエラー:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "サーバーで予期せぬエラーが発生しました。";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
