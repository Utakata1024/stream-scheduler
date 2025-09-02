// Twitch APIのベースURL
const TWITCH_API_BASE_URL = "https://api.twitch.tv/helix";
const TWITCH_AUTH_BASE_URL = "https://id.twitch.tv/oauth2";

interface TwitchStream {
  id: string;
  user_id: string;
  user_name: string;
  type: "live" | "";
  title: string;
  started_at: string;
  thumbnail_url: string;
}

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

// キャッシュ（有効期限:5分）
const twitchStreamCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

// App Access Tokenを取得する関数
export async function getAppAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const url = `${TWITCH_AUTH_BASE_URL}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  try {
    const response = await fetch(url, {
      method: "POST",
    });
    const data: TwitchTokenResponse = await response.json();
    if (data.access_token) {
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error("Twitch App Access Tokenの取得に失敗しました。", error);
    return null;
  }
}

// チャンネルIDからライブ配信情報を取得する関数
export async function fetchTwitchStreams(
  channelIds: string[],
  accessToken: string,
  clientId: string
): Promise<TwitchStream[]> {
  if (channelIds.length === 0) {
    return [];
  }

  // キャッシュキー生成
  const cacheKey = channelIds.sort().join(",");

  // キャッシュからデータ取得
  const cachedData = twitchStreamCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL_MS) {
    console.log(`Cache hit for Twitch channels: ${cacheKey}`);
    return cachedData.data;
  }

  const query = channelIds.map((id) => `user_id=${id}`).join("&");
  const url = `${TWITCH_API_BASE_URL}/streams?${query}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
    });
    const data = await response.json();

    if (response.status !== 200) {
      console.error("Twitch APIからのレスポンスがエラーです:", data);
      return [];
    }

    if (data.data) {
      // 取得したデータをキャッシュに保存
      twitchStreamCache.set(cacheKey, {
        data: data.data,
        timestamp: Date.now(),
      });
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Twitch Streamsの取得に失敗しました。", error);
    return [];
  }
}

/**
 * チャンネル名からTwitchユーザー情報を取得する関数
 * @param userLogin 取得したいTwitchユーザーのログイン名
 * @param accessToken Twitch App Access Token
 * @param clientId Twitch Client ID
 * @returns Twitchユーザー情報
 */

export async function fetchUserByLogin(
  userLogin: string,
  accessToken: string,
  clientId: string
): Promise<TwitchUser | null> {
  const url = `${TWITCH_API_BASE_URL}/users?login=${userLogin}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
    });
    const data = await response.json();

    if (response.status !== 200) {
      console.error("Twitch APIからのレスポンスがエラーです:", data);
      return null;
    }

    if (data.data && data.data.length > 0) {
      const userData = data.data[0];
      return {
        id: userData.id,
        login: userData.login,
        display_name: userData.display_name,
        profile_image_url: userData.profile_image_url,
      };
    }
    return null;
  } catch (error) {
    console.error("Twitchユーザー情報の取得に失敗しました。", error);
    return null;
  }
}
