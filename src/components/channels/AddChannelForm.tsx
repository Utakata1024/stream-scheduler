"use client";

import React, { useState } from "react";

interface AddChannelFormProps {
  onAddChannel: (
    newChannelInput: string,
    resetInput: (id: string) => void
  ) => Promise<void>;
  addingChannel: boolean;
}

export default function AddChannelForm({
  onAddChannel,
  addingChannel,
}: AddChannelFormProps) {
  const [newChannelInput, setNewChannelInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddChannel(newChannelInput, setNewChannelInput);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        チャンネルを追加
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          id="new-channel-id"
          type="text"
          value={newChannelInput}
          onChange={(e) => setNewChannelInput(e.target.value)}
          placeholder="YouTubeチャンネルIDまたはTwitchユーザー名を入力"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={addingChannel}
          required
        />
        <button
          type="submit"
          disabled={addingChannel}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          {addingChannel ? "追加中..." : "追加"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-3 text-center">
        ※YouTubeチャンネルIDはチャンネルのURLから取得できます。
        (例:youtube.com/channel/
        <span className="underline decoration-red-500">UC...</span>)
        ※Twitchユーザー名はチャンネルのURLから取得できます。
        (例:twitch.tv/
        <span className="underline decoration-red-500">...</span>)
      </p>
    </div>
  );
}
