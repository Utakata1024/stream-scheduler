import Image from "next/image";

interface StreamCardProps {
  thumbnailUrl: string;
  title: string;
  channelName: string;
  dateTime: string;
  status: "live" | "upcoming" | "ended";
  streamUrl: string;
  platform: "youtube" | "twitch";
  channelIconUrl: string;
}

export default function StreamCard({
  thumbnailUrl,
  title,
  channelName,
  dateTime,
  status,
  streamUrl,
  platform,
  channelIconUrl,
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
      ? "bg-red-500 text-white"
      : status === "upcoming"
      ? "bg-blue-500 text-white"
      : "bg-gray-400 text-white";

  const statusIcon =
    status === "live"
      ? "/live-icon.png"
      : status === "upcoming"
      ? "/upcoming-icon.png"
      : "/ended-icon.png";

  const platformIcon =
    platform === "youtube" ? "/youtube-logo.svg" : "/twitch-logo.png";

  const platformAlt = platform === "youtube" ? "YouTube" : "Twitch";

  return (
    // カード全体をリンクに
    <a
      href={streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="relative w-full h-48">
          {/* 配信サムネイル */}
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
            unoptimized={true}  // Vercelの外部画像最適化を無効化
          />
        </div>
        <div className="relative p-4 md:p-6">
          <h2 className="text-base md:text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <div className="flex items-center gap-2 mb-1">
            {channelIconUrl && (
              <Image
                src={channelIconUrl}
                alt={channelName}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div className="flex flex-col">
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mb-1">
                {channelName}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">{dateTime}</p>
            </div>
          </div>
          {/* 配信状態 */}
          <div className={`inline-flex items-center rounded px-2 py-1 mt-2 text-sm ${statusClass}`}>
            <Image
              src={statusIcon}
              alt={statusText}
              width={16}
              height={16}
              className="mr-2"
            />
            <p className="font-bold">{statusText}</p>
          </div>
          {/* プラットフォームロゴ */}
          <div className="absolute bottom-4 right-4">
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
