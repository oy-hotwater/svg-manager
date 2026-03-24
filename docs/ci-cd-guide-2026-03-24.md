# CI/CDパイプライン導入および運用ガイド

本ドキュメントは、`svg-manager`におけるGitHub Actionsを用いた継続的インテグレーション（CI）および継続的デプロイ（CD）の仕様と、セットアップ手順をまとめたものです。

## 1. 目的と概要

システムの品質保証とリリース作業の自動化を目的とし、GitHub Actionsを導入しています。開発環境（Docker）で指定されている `node:20-slim` と同等のクリーンな環境（Node.js 20）をCI上で都度構築し、再現性の高い検証とデプロイを行います。

## 2. ワークフローの仕様

ワークフロー定義ファイル: `.github/workflows/ci-cd.yml`

### トリガー条件

- `main` ブランチへの `push`（マージを含む）
- `main` ブランチを対象とした Pull Request の作成および更新

### 実行ジョブ

ワークフローは以下の2つのジョブで構成されています。

1. **Continuous Integration (CI)**
   - 依存関係のインストール (`npm ci`)
   - CI用ダミー環境変数の生成 (`.env.example` をコピー)
   - 静的解析・型チェック (`tsc --noEmit`, `eslint`)
   - 自動テスト (`vitest run`)
   - ビルドの検証 (`vite build`)
2. **Continuous Deployment (CD)**
   - CIジョブがすべて成功した場合のみ実行
   - `main` ブランチへの `push` 時のみ実行（Pull Request時はスキップ）
   - GitHub Secretsから本番用環境変数を注入し `.env` を生成
   - Firebase Hosting および Firestore ルールへの自動デプロイ

## 3. GitHub Secrets の設定手順

CDパイプラインを正常に稼働させるには、GitHubリポジトリの `Settings` > `Secrets and variables` > `Actions` に以下のシークレットを登録する必要があります。

### 3.1 Firebase デプロイトークン

ローカル環境で以下のコマンドを実行し、CI用の認証トークンを取得します。

```bash
npx firebase-tools login:ci
```

認証後にターミナルに出力されるトークン文字列（`1//0g...` など）をコピーし、以下の名前でSecretに登録します。

- `FIREBASE_TOKEN`

### 3.2 アプリケーション環境変数

`.env.example` に定義されている以下の変数を、それぞれ個別のSecretとして登録します。値はFirebaseプロジェクトの設定画面から取得した本番用のものを指定します。

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_UID`

## 4. 運用上の留意点

### 作業ブランチでのCI動作確認

原則として、`main` ブランチに向けた Pull Request を作成することでCIが自動実行されます。
Pull Requestを作成する前の段階で、作業ブランチ上で直接Actionsの挙動を確認したい場合は、一時的に `ci-cd.yml` の `push` トリガーに作業ブランチ名を追記して検証してください。なお、CDジョブには `main` ブランチ保護の条件が設定されているため、作業ブランチから誤って本番デプロイが実行されることはありません。
