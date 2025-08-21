import Image from "next/image";

interface StreamCardProps {
  thumbnailUrl: string;
  title: string;
  channelName: string;
  dateTime: string;
  status: "live" | "upcoming" | "ended";
  streamUrl: string;
  platform: "youtube" | "twitch";
}

export default function StreamCard({
  thumbnailUrl,
  title,
  channelName,
  dateTime,
  status,
  streamUrl,
  platform,
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

  const platformIcon =
    platform === "youtube" ? "/youtube-logo.svg" : "/twitch-logo.png";

  const platformAlt = platform === "youtube" ? "YouTube" : "Twitch";

  return (
    // カード全体をリンクに
    <a
      href={streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative w-full h-48">
          {/* 配信サムネイル */}
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="relative p-4">
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h2>
          <p className="text-gray-600 text-sm mb-1">{channelName}</p>
          <p className="text-gray-600 text-sm">{dateTime}</p>
          <p className={`mt-2 ${statusClass}`}>{statusText}</p>
          {/* プラットフォームロゴ */}
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-md p-1">
            <Image
              src={platformIcon}
              alt={platformAlt}
              width={48}
              height={48}
            />
          </div>
        </div>
      </div>
    </a>
  );
}
