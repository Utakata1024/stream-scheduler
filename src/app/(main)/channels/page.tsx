// チャンネル管理ページ

"use client";

import { useEffect, useState } from "react";
import { doc, setDoc, deleteDoc, collection, query, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth"; // ユーザー認証状態の監視用
import { db, auth } from "@/lib/firebase";
import { fetchChannelDetails, YoutubeChannelData } from "@/lib/api/youtube";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<YoutubeChannelData[]>([]); // 登録済みチャンネルIDのリスト
  const [newChannelId, setNewChannelId] = useState<string>(""); // 新規チャンネルID入力用
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // エラーメッセージ用
  const [successMessage, setSuccessMessage] = useState<string | null>(null); //成功メッセージ用
  const [addingChannel, setAddingChannel] = useState(false); // チャンネル追加中のローディング状態
  const [user, setUser] = useState<User | null>(null); // ログインユーザー情報を保持
  const [loading, setLoading] = useState(true); // ロード状態を管理

  // ユーザーのログイン状態を監視してFirestoreからデータを読み込むロジック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // ユーザー情報を更新
      if (currentUser) {
        // ログインしている場合のみデータを読み込む
        if (db) {
          await fetchAndLoadChannels(currentUser.uid);
        } else {
          console.error("Firestoreが初期化されていません");
          setErrorMessage("データベースが利用できません");
          setLoading(false);
        }
      } else {
        // ログインしていない場合はチャンネルリストを空に
        setChannels([]);
        setLoading(false);
      }
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  // Firestoreからチャンネルデータを取得する関数
  const fetchAndLoadChannels = async (uid: string) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      setErrorMessage("YouTube APIキーが設定されていません");
      setLoading(false);
      return;
    }

    if (!db) {
      console.error("Firestoreが初期化されていません");
      setErrorMessage("データベースを利用できません");
      setLoading(false);
      return;
    }

    const userChannelsRef = collection(db, `users/${uid}/channels`); // ユーザーごとのコレクションパス
    const q = query(userChannelsRef); // クエリを作成
    const fetchedChannelData: YoutubeChannelData[] = [];
    try {
      const querySnapshot = await getDocs(q); // クエリの結果を取得
      querySnapshot.forEach((doc) => {
        const data = doc.data(); // ドキュメントのフィールドデータ取得
        fetchedChannelData.push({
          channelId: doc.id, // ドキュメントIDを追加
          channelName: data.channelName || "チャンネル名不明", // Firestoreに保存された名前
          thumbnailUrl: data.thumbnailUrl || "", // Firestoreに保存されたサムネイルURL
        });
      });
      setChannels(fetchedChannelData); // チャンネルリストを更新
    } catch (error) {
      console.error("チャンネルの取得に失敗しました", error);
      setErrorMessage("チャンネルの取得に失敗しました");
    } finally {
      setLoading(false); // ロード状態を終了
    }
  };

  // チャンネルIDを追加する関数
  const handleAddChannel = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 入力値のトリミングと空チェック
    if (newChannelId.trim() === "") {
      setErrorMessage("チャンネルIDを入力してください。");
      return;
    }

    if (!user) {
      // ユーザーがログインしていない場合
      setErrorMessage("ログインしていません。");
      return;
    }

    // 登録済みかチェック
    const trimmedChannelId = newChannelId.trim();
    if (channels.some((c) => c.channelId === trimmedChannelId)) {
      setErrorMessage("このチャンネルIDは既に登録されています。");
      setNewChannelId(""); // 入力欄クリア
      return;
    }

    setAddingChannel(true); // チャンネル追加中のローディング開始

    // YouTubeAPIキーの取得
    const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      setErrorMessage("YouTube APIキーが設定されていません");
      setAddingChannel(false);
      return;
    }

    if (!db) {
      console.error("Firestoreが初期化されていません");
      setErrorMessage("データベースを利用できません");
      setAddingChannel(false);
      return;
    }

    try {
      // YouTubeAPIで詳細情報取得
      const channelDetails = await fetchChannelDetails(
        trimmedChannelId,
        YOUTUBE_API_KEY
      );

      if (!channelDetails) {
        setErrorMessage("指定されたチャンネルIDが見つかりません");
        setNewChannelId(""); // 入力欄クリア
        return;
      }

      // Firestoreにチャンネル情報を保存
      const channelDocRef = doc(
        db,
        `users/${user.uid}/channels`,
        channelDetails.channelId
      );
      await setDoc(channelDocRef, {
        channelName: channelDetails.channelName,
        thumbnailUrl: channelDetails.thumbnailUrl,
        addedAt: new Date(), // 追加日時を保存
      });

      // 新しいチャンネルを追加
      setChannels([...channels, channelDetails]);
      setNewChannelId(""); // 入力欄クリア
      setSuccessMessage("チャンネルが追加されました");
    } catch (error) {
      console.error("チャンネルの追加に失敗しました", error);
      setErrorMessage("チャンネルの追加に失敗しました");
    } finally {
      setAddingChannel(false); // try, catchどちらを通ってもここでローディング終了
    }
  };

  // チャンネルIDを削除する関数
  const handleDeleteChannel = async (channelIdToDelete: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      setErrorMessage("チャンネルを削除するにはログインが必要です。");
      return;
    }
    if (!db) {
      console.error("Firestore DB is not initialized for deleting.");
      setErrorMessage("データベースが利用できません。");
      return;
    }

    // 削除の確認
    if (confirm(`チャンネルID "${channelIdToDelete}" を削除しますか？`)) {
      setLoading(true); // 削除中のローディング開始
      try {
        // Firestoreからドキュメントを削除
        const channelDocRef = doc(
          db,
          `users/${user.uid}/channels`,
          channelIdToDelete
        );
        await deleteDoc(channelDocRef);

        // 削除対象を除いて新しくリスト作成
        setChannels(
          channels.filter((channel) => channel.channelId !== channelIdToDelete)
        );
        setSuccessMessage("チャンネルが削除されました!");
      } catch (error) {
        console.error("チャンネルの削除に失敗しました", error);
        setErrorMessage("チャンネルの削除に失敗しました");
      } finally {
        setLoading(false); // ローディング終了
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">チャンネル管理</h1>

      {/* ロード中表示 */}
      {loading && (
        <div className="text-center text-xl text-gray-700 mb-4">
          {user ? "チャンネルを読み込み中..." : "ログイン状態を確認中..."}
        </div>
      )}

      {/* ユーザーがログインしていない場合のメッセージ */}
      {!user && !loading && (
        <div className="text-center text-xl text-red-600">
          チャンネル管理機能を利用するにはログインが必要です。
          <p className="mt-2"><a href="/login" className="text-indigo-600 hover:underline">ログインページへ</a></p>
        </div>
      )}

      {/* メッセージ表示エリア */}
      {errorMessage && (
        <p className="text-center text-red-500 text-sm mt-4">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-center text-green-600 text-sm mt-4">
          {successMessage}
        </p>
      )}

      {/* ログインしている場合のみ表示 */}
      {user && !loading && (
        <>
          {/* チャンネルID入力フォーム */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              チャンネルを追加
            </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newChannelId}
              onChange={(e) => setNewChannelId(e.target.value)}
              placeholder="チャンネルIDを入力"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={addingChannel} // 追加中は入力不可
            />
            <button
              onClick={handleAddChannel}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              disabled={addingChannel} // 追加中はボタン無効化
            >
              {addingChannel ? "追加中..." : "追加"} {/* ローディング表示 */}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            ※チャンネルIDはYouTubeチャンネルのURLから取得できます。
            (例:youtube.com/channel/<span className="underline decoration-red-500">UC...</span>)
          </p>
        </div>

        {/* 登録済みチャンネルIDのリスト */}
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
                  {/* チャンネル名とアイコンの表示 */}
                  <div className="flex items-center gap-3">
                    {channel.thumbnailUrl && (
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.channelName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="font-medium text-gray-800 break-all">
                      {channel.channelName}
                    </span>
                    {/* デバッグ用にIDも表示 */}
                    <span className="text-gray-500 text-xs hidden sm:inline-block">
                      ({channel.channelId})
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteChannel(channel.channelId)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        </>
      )}
      </div>
  );
}
