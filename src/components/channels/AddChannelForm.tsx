"use client";

import React, { useState } from "react";

interface AddChannelFormProps {
  onAddChannel: (
    channelId: string,
    resetInput: (id: string) => void
  ) => Promise<void>;
  addingChannel: boolean;
}

export default function AddChannelForm({
  onAddChannel,
  addingChannel,
}: AddChannelFormProps) {
  const [newChannelId, setNewChannelId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddChannel(newChannelId, setNewChannelId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        チャンネルを追加
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={newChannelId}
          onChange={(e) => setNewChannelId(e.target.value)}
          placeholder="YouTubeチャンネルID"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={addingChannel}
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
        ※チャンネルIDはYouTubeチャンネルのURLから取得できます。
        (例:youtube.com/channel/<span className="underline decoration-red-500">UC...</span>)
      </p>
    </div>
  );
}
