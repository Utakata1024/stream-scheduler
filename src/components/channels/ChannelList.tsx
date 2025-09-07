"use client";

import React from "react";
import Image from "next/image";

interface UnifiedChannelData {
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  platform: "youtube" | "twitch";
}

interface ChannelListProps {
  title: string;
  channels: UnifiedChannelData[];
  onDeleteChannel: (channelId: string) => Promise<void>;
}

export default function ChannelList({
  title,
  channels,
  onDeleteChannel,
}: ChannelListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      {channels.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          まだ登録されたチャンネルはありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {channels.map((channel) => (
            <li
              key={channel.channelId}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <div className="flex items-center gap-3 w-0 flex-grow">
                {channel.thumbnailUrl && (
                  <a
                    href={
                      channel.platform === "youtube"
                        ? `https://www.youtube.com/channel/${channel.channelId}`
                        : `https://www.twitch.tv/${channel.channelName}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-8 h-8 flex-shrink-0">
                      <Image
                        src={channel.thumbnailUrl}
                        alt={channel.channelName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  </a>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">
                    {channel.channelName}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs hidden sm:inline-block">
                    ({channel.channelId})
                  </span>
                </div>
              </div>
              <button
                onClick={() => onDeleteChannel(channel.channelId)}
                className="ml-4 px-3 py-1 bg-red-500 text-white dark:bg-red-600 dark:hover:bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm flex-shrink-0"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
