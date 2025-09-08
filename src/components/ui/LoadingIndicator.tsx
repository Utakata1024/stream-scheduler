import React from "react";
import { User } from "@supabase/supabase-js";

interface LoadingIndicatorProps {
  loading: boolean;
  user: User | null;
}

export default function LoadingIndicator({ loading, user }: LoadingIndicatorProps) {
    if (!loading) return null;

    return (
        <div className="text-center text-xl text-gray-700 mb-4">
            <p>{user ? "データを読み込み中..." : "ログイン状態を確認中..."}</p>
        </div>
    );
}
