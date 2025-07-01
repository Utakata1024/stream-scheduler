'use client';

import { useState } from 'react';

export default function LoginForm() {
    // ユーザーの入力値のための状態変数定義
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    // フォーム送信時の処理
    // あとで実装

    return (
        <div>
            <h1>ログイン</h1>
            <div>
                <h2>ユーザーID</h2>
                <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="ユーザーIDを入力"
                />
            </div>
            <div>
                <h2>パスワード</h2>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                />
            </div>
            <div>
                <button>ログイン</button>
            </div>

        </div>
    )
}