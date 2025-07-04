// スケジュールページ

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        直近のスケジュール
      </h1>
      {/* 切り替えボタン */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-center gap-4">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          直近
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          現在配信中
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          今後
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 配信カードを仮設置。後で実装 */}
        <div className="bg-white rounded-lg shadow-md p-4">配信カード1</div>
        <div className="bg-white rounded-lg shadow-md p-4">配信カード2</div>
        <div className="bg-white rounded-lg shadow-md p-4">配信カード3</div>
      </div>
    </div>
  );
}
