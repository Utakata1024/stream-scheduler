"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, setDoc, deleteDoc, collection, query, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import AddChannelForm from "@/components/channels/AddChannelForm";
import ChannelList from "@/components/channels/ChannelList";
import AlertMessage from "@/components/ui/AlertMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

// 統一されたチャンネルデータ型を定義
interface UnifiedChannelData {
    channelId: string;
    channelName: string;
    thumbnailUrl: string;
    platform: 'youtube' | 'twitch';
}

export default function ChannelsPage() {
    const [channels, setChannels] = useState<UnifiedChannelData[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [addingChannel, setAddingChannel] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAndLoadChannels = useCallback(async (uid: string) => {
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        
        if (!db) {
            setErrorMessage("データベースが利用できません");
            setLoading(false);
            return;
        }

        const userChannelsRef = collection(db, `users/${uid}/channels`);
        const q = query(userChannelsRef);
        const fetchedChannelData: UnifiedChannelData[] = [];
        
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedChannelData.push({
                    channelId: doc.id,
                    channelName: data.channelName || "チャンネル名不明",
                    thumbnailUrl: data.thumbnailUrl || "",
                    platform: data.platform || 'youtube', // Firestoreからプラットフォーム情報を取得
                });
            });
            setChannels(fetchedChannelData);
        } catch (error) {
            console.error("チャンネルの取得に失敗しました", error);
            setErrorMessage("チャンネルの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchAndLoadChannels(currentUser.uid);
            } else {
                setChannels([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchAndLoadChannels]);

    const handleAddChannel = async (newChannelInput: string, resetInput: (input: string) => void) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (newChannelInput.trim() === "") {
            setErrorMessage("チャンネル名またはIDを入力してください。");
            return;
        }
        if (!user) {
            setErrorMessage("ログインしていません。");
            return;
        }
        setAddingChannel(true);
        const trimmedInput = newChannelInput.trim();
        
        try {
            const response = await fetch(`http://localhost:8080/api/channels`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-ID": user.uid,
                },
                body: JSON.stringify({ input: trimmedInput }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "チャンネルの追加に失敗しました。");
            }

            const newChannelData = await response.json();
            
            setChannels(prev => [...prev, newChannelData]);
            resetInput("");
            setSuccessMessage("チャンネルが追加されました");
        } catch (error: any) {
            console.error("チャンネルの追加に失敗しました", error);
            setErrorMessage(error.message || "チャンネルの追加に失敗しました");
        } finally {
            setAddingChannel(false);
        }
    };

    const handleDeleteChannel = async (channelIdToDelete: string) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (!user) {
            setErrorMessage("チャンネルを削除するにはログインが必要です。");
            return;
        }
        if (confirm(`チャンネルID "${channelIdToDelete}" を削除しますか？`)) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/channels`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-ID": user.uid,
                    },
                    body: JSON.stringify({ channelId: channelIdToDelete }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "チャンネルの削除に失敗しました。");
                }
                
                setChannels(channels.filter((channel) => channel.channelId !== channelIdToDelete));
                setSuccessMessage("チャンネルが削除されました!");
            } catch (error) {
                console.error("チャンネルの削除に失敗しました", error);
                setErrorMessage("チャンネルの削除に失敗しました");
            } finally {
                setLoading(false);
            }
        }
    };

    const youtubeChannels = channels.filter(c => c.platform === 'youtube');
    const twitchChannels = channels.filter(c => c.platform === 'twitch');

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-bold text-center mb-8">チャンネル管理</h1>
            <LoadingIndicator loading={loading} user={user} />
            <AlertMessage message={errorMessage} type="error" />
            <AlertMessage message={successMessage} type="success" />
            {!user && !loading && <p className="text-center text-xl text-red-600">チャンネル管理機能を利用するにはログインが必要です。<p className="mt-2"><a href="/login" className="text-indigo-600 hover:underline">ログインページへ</a></p></p>}
            {user && !loading && (
                <>
                    <AddChannelForm onAddChannel={handleAddChannel} addingChannel={addingChannel} />
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ChannelList title="YouTubeチャンネル" channels={youtubeChannels} onDeleteChannel={handleDeleteChannel} />
                        <ChannelList title="Twitchチャンネル" channels={twitchChannels} onDeleteChannel={handleDeleteChannel} />
                    </div>
                </>
            )}
        </div>
    );
}
