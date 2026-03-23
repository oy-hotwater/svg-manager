# 自動デプロイ未実装時の、Firebase Hositingサイトへのコード変更反映方法-2026-03-24

Dockerコンテナの立ち上げから、PC上でのコード変更をFirebaseの静的サイトにデプロイするまでの一連のフローを整理します

1. Dockerコンテナの起動とアクセス

```bash
# コンテナのビルドと起動
docker compose up -d

# コンテナ内部（appサービス）に入る
docker compose exec -it app bash
```

2. Firebaseへのログイン（初回のみ）

```bash
# ブラウザを立ち上げずにログイン処理を開始
npx firebase-tools login --no-localhost
```

- Ok to proceed? -> y
- Enable Gemini in Firebase features? -> n
- Allow Firebase to collect CLI and Emulator Suite usage and error reporting information? -> n
- ターミナルに表示されたURLを開き、authorization codeをコピーしてターミナルに張る
- Firebase CLIにログイン

3. ローカルでの開発と変更
   ローカルファイルの変更。1と2の前に行ってもおそらく大丈夫

4. デプロイの準備と実行

- ルールの生成
  環境変数を使用してFirestoreなどのセキュリティルールを生成するスクリプトを実行

```bash
npm run predeploy:rules
```

- デプロイの実行
  Firebase Hostingに変更を反映させます

```bash
npx firebase-tools deploy
```
