import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // 許可する画像ホスト名（ドメイン）を配列で指定
    domains: [
      'placehold.co', 
      'i.ytimg.com',  // YouTube API連携用
      'yt3.ggpht.com', // YouTubeチャンネルアイコン用
      // 他のドメインがあればここに追加
    ],
  },
};

export default nextConfig;
