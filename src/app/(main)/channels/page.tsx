"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchChannelDetails as fetchYoutubeChannelDetails } from "@/lib/api/youtube";
import { fetchUserByLogin, getAppAccessToken } from "@/lib/api/twitch";
import AddChannelForm from "@/components/channels/AddChannelForm";
import ChannelList from "@/components/channels/ChannelList";
import AlertMessage from "@/components/ui/AlertMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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

    const fetchAndLoadChannels = useCallback(async () => {
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            setUser(null);
            setLoading(false);
            return;
        }

        setUser(sessionData.session.user);

        try {
            const { data, error } = await supabase.from('channels').select('*').eq('user_id',sessionData.session.user.id);
            if (error) {
                throw error;
            }

            const fetchedChannelData: UnifiedChannelData[] = data.map((channel) => ({
                channelId: channel.id,
                channelName: channel.channelName,
                thumbnailUrl: channel.thumbnailUrl,
                platform: channel.platform
            }));

            setChannels(fetchedChannelData);
        } catch (error) {
            console.error("チャンネルの取得に失敗しました", error);
            if (error instanceof Error) {
                setErrorMessage(error.message || "チャンネルの取得に失敗しました");
            } else {
                setErrorMessage("チャンネルの取得に失敗しました");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Supabaseの認証状態を監視し、ログイン状態に応じてチャンネルを読み込む
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    fetchAndLoadChannels();
                } else {
                    setChannels([]);
                    setLoading(false);
                    setUser(null);
                }
            }
        );

        // 初回ロード時の認証状態を確認
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchAndLoadChannels();
            } else {
                setChannels([]);
                setLoading(false);
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
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
        let channelDetails = null;
        let channelId = '';
        let platform: 'youtube' | 'twitch';
        try {
            const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
            const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
            const TWITCH_CLIENT_SECRET = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET;
            if (trimmedInput.startsWith('UC')) {
                platform = 'youtube';
                channelId = trimmedInput;
                if (!YOUTUBE_API_KEY) throw new Error("YouTube APIキーが設定されていません");
                channelDetails = await fetchYoutubeChannelDetails(channelId, YOUTUBE_API_KEY);
            } else {
                platform = 'twitch';
                if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) throw new Error("Twitch APIキーが設定されていません");
                const twitchAccessToken = await getAppAccessToken(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
                if (!twitchAccessToken) throw new Error("Twitch認証トークンの取得に失敗しました。");
                const twitchUser = await fetchUserByLogin(trimmedInput, twitchAccessToken, TWITCH_CLIENT_ID);
                if (twitchUser) {
                    channelId = twitchUser.id;
                    channelDetails = {
                        channelId: twitchUser.id,
                        channelName: twitchUser.display_name,
                        thumbnailUrl: twitchUser.profile_image_url
                    };
                }
            }
            if (!channelDetails) {
                setErrorMessage("指定されたチャンネルが見つかりません。");
                resetInput("");
                return;
            }
            if (channels.some((c) => c.channelId === channelId)) {
                setErrorMessage("このチャンネルは既に登録されています。");
                resetInput("");
                return;
            }
            const { error } = await supabase.from('channels').insert({
                id: channelId,
                user_id: user.id,
                channelName: channelDetails.channelName,
                thumbnailUrl: channelDetails.thumbnailUrl,
                platform: platform,
                addedAt: new Date().toISOString(),
            })
            if (error) {
                throw error;
            }

            const newChannel: UnifiedChannelData = {
                channelId: channelDetails.channelId,
                channelName: channelDetails.channelName,
                thumbnailUrl: channelDetails.thumbnailUrl,
                platform: platform
            }

            setChannels([...channels, newChannel]);
            resetInput("");
            setSuccessMessage("チャンネルが追加されました");
        } catch (error) {
            console.error("チャンネルの追加に失敗しました", error);
            if (error instanceof Error) {
                setErrorMessage(error.message || "チャンネルの追加に失敗しました");
            } else {
                setErrorMessage("チャンネルの追加に失敗しました");
            }
        } finally {
            setAddingChannel(false);
        }
    };

    const handleDeleteChannel = async (channelIdToDelete: string) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (!user   ) {
            setErrorMessage("チャンネルを削除するにはログインが必要です。");
            return;
        }
        if (confirm(`チャンネルID "${channelIdToDelete}" を削除しますか？`)) {
            setLoading(true);
            try {
                const { error } = await supabase
                    .from('channels')
                    .delete()
                    .eq('id', channelIdToDelete)
                    .eq('user_id', user.id);

                if (error) {
                    throw error;
                }
                
                setChannels(channels.filter((channel) => channel.channelId !== channelIdToDelete));
                setSuccessMessage("チャンネルが削除されました!");
            } catch (error) {
                console.error("チャンネルの削除に失敗しました", error);
                if (error instanceof Error) {
                    setErrorMessage(error.message || "チャンネルの削除に失敗しました");
                } else {
                    setErrorMessage("チャンネルの削除に失敗しました");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const youtubeChannels = channels.filter(c => c.platform === 'youtube');
    const twitchChannels = channels.filter(c => c.platform === 'twitch');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">チャンネル管理</h1>
            <LoadingIndicator loading={loading} user={user} />
            <AlertMessage message={errorMessage} type="error" />
            <AlertMessage message={successMessage} type="success" />
            {!user && !loading && <p className="text-center text-xl text-red-600 dark:text-red-400">チャンネル管理機能を利用するにはログインが必要です。<p className="mt-2"><a href="/login" className="text-indigo-600 hover:underline">ログインページへ</a></p></p>}
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
