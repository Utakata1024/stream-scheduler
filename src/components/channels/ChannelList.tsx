"use client";

import React from "react";
import { YoutubeChannelData } from "@/lib/api/youtube";
import Image from "next/image";

interface ChannelListProps {
  channels: YoutubeChannelData[];
  onDeleteChannel: (channelId: string) => Promise<void>;
}

export default function ChannelList({
  channels,
  onDeleteChannel,
}: ChannelListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        登録済みチャンネル
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
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200"
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
