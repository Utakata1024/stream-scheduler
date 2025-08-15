// チャンネル管理ページ

"use client";

import { useEffect, useState } from "react";
import { doc, setDoc, deleteDoc, collection, query, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { fetchChannelDetails, YoutubeChannelData } from "@/lib/api/youtube";
import AddChannelForm from "@/components/channels/AddChannelForm";
/*
import ChannelList from "@/components/channels/ChannelList";
import AlertMessage from "@/components/ui/AlertMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
*/

export default function ChannelsPage() {
  const [channels, setChannels] = useState<YoutubeChannelData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addingChannel, setAddingChannel] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザーのログイン状態を監視してFirestoreからデータを読み込むロジック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // ユーザー情報を更新
      if (currentUser) {
        // ログイン時→データを読み込む
        if (db) {
          await fetchAndLoadChannels(currentUser.uid);
        } else {
          console.error("Firestoreが初期化されていません");
          setErrorMessage("データベースが利用できません");
          setLoading(false);
        }
      } else {
        // 非ログイン→チャンネルリストを空に
        setChannels([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
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

    // ユーザーのチャンネル情報取得・リスト更新
    const userChannelsRef = collection(db, `users/${uid}/channels`);
    const q = query(userChannelsRef);
    const fetchedChannelData: YoutubeChannelData[] = [];
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedChannelData.push({
          channelId: doc.id,
          channelName: data.channelName || "チャンネル名不明",
          thumbnailUrl: data.thumbnailUrl || "",
        });
      });
      setChannels(fetchedChannelData); // チャンネルリストを更新
    } catch (error) {
      console.error("チャンネルの取得に失敗しました", error);
      setErrorMessage("チャンネルの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // チャンネルIDを追加する関数
  const handleAddChannel = async (newChannelId: string, setNewChannelId: (id: string) => void) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newChannelId.trim() === "") {
      setErrorMessage("チャンネルIDを入力してください。");
      return;
    }
    if (!user) {
      setErrorMessage("ログインしていません。");
      return;
    }
    // 登録済みかチェック
    const trimmedChannelId = newChannelId.trim();
    if (channels.some((c) => c.channelId === trimmedChannelId)) {
      setErrorMessage("このチャンネルIDは既に登録されています。");
      setNewChannelId("");
      return;
    }

    setAddingChannel(true); // チャンネル追加中のローディング開始

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
      setNewChannelId("");
      setSuccessMessage("チャンネルが追加されました");
    } catch (error) {
      console.error("チャンネルの追加に失敗しました", error);
      setErrorMessage("チャンネルの追加に失敗しました");
    } finally {
      setAddingChannel(false); // ローディング終了
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
      {/*
      <LoadingIndicator loading={loading} user={user} />
      <AlertMessage message={errorMessage} type="error" />
      <AlertMessage message={successMessage} type="success" />
      {!user && !loading && <p className="text-center text-xl text-red-600">チャンネル管理機能を利用するにはログインが必要です。<p className="mt-2"><a href="/login" className="text-indigo-600 hover:underline">ログインページへ</a></p></p>}
      {user && !loading && (
        <>
          <AddChannelForm onAddChannel={handleAddChannel} addingChannel={addingChannel} />
          <ChannelList channels={channels} onDeleteChannel={handleDeleteChannel} />
        </>
      )}
      */}
    </div>
  );
}
