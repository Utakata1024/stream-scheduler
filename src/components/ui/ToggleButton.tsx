"use client";

import React from "react";

// ToggleButtonが受け取るpropsの型定義
interface ToggleButtonProps {
  label: string; // ボタンに表示するテキスト
  isActive: boolean; // 選択状態
  onClick: () => void;
}

export default function ToggleButton({ label, isActive, onClick }: ToggleButtonProps) {
  // isActiveの状態に応じてボタンのスタイルを動的に変更
  const baseClasses = "px-4 py-2 rounded font-semibold transition-colors duration-200";
  const activeClasses = "bg-indigo-600 text-white shadow-md hover:bg-indigo-700";
  const inactiveClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} // isActiveによってクラスを切り替え
      onClick={onClick}
    >
      {label}
    </button>
  );
}
