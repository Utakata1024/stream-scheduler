"use client";

import React from "react";
import Image from "next/image";

interface UnifiedChannelData {
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  platform: 'youtube' | 'twitch';
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {title}
      </h2>
      {channels.length === 0 ? (
        <p className="text-center text-gray-600">
          まだ登録されたチャンネルはありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {channels.map((channel) => (
            <li
              key={channel.channelId}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 transition-colors duration-200 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                {channel.thumbnailUrl && (
                  <Image
                    src={channel.thumbnailUrl}
                    alt={channel.channelName}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="font-medium text-gray-800 break-all">
                  {channel.channelName}
                </span>
                <span className="text-gray-500 text-xs hidden sm:inline-block">
                  ({channel.channelId})
                </span>
              </div>
              <button
                onClick={() => onDeleteChannel(channel.channelId)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
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
