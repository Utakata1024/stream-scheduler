import Image from "next/image";

interface StreamCardProps {
  thumbnailUrl: string; // サムネイルURL
  title: string; // タイトル
  channelName: string; // チャンネル名
  time: string; // 配信日時
  status: "live" | "upcoming" | "ended"; // 配信ステータス'
  streamUrl: string; // 配信URL
}

export default function StreamCard({
  thumbnailUrl,
  title,
  channelName,
  time,
  status,
  streamUrl,
}: StreamCardProps) {
  // 配信状態に応じたテキスト・スタイル
  const statusText =
    status === "live"
      ? "配信中"
      : status === "upcoming"
      ? "配信予定"
      : "終了済み";

  const statusClass =
    status === "live"
      ? "text-green-600 font-bold"
      : status === "upcoming"
      ? "text-blue-600 font-bold"
      : "text-gray-500";
  return (
    // カード全体をリンクに
    <a
      href={streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div>
        {/* 配信サムネイル */}
        <Image
          src={thumbnailUrl}
          alt={title}
          width={480}
          height={270}
          layout="responsive" // 親要素の幅に合わせてレスポンシブに表示
          objectFit="cover" // 画像がコンテナを覆うように調整
          className="w-full h-auto" // Tailwind CSSでレスポンシブ対応
        />
        <div className="p-4">
          {/* 配信タイトル */}
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h2>
          {/* チャンネル名 */}
          <p className="text-gray-600 text-sm mb-1">{channelName}</p>
          {/* 配信日時 */}
          <p className="text-gray-600 text-sm">{time}</p>
          {/* 配信状態 */}
          <p className={`mt-2 ${statusClass}`}>{statusText}</p>
        </div>
      </div>
    </a>
  );
}
