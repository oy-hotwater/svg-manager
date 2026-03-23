# **SVG Manager README**

## **概要**

SVG Managerは、開発やデザインで頻繁に利用するSVGアセットをクラウド上で一元管理するための、個人利用を前提としたシングルページアプリケーション(SPA)です。

ブラウザからSVGコードを直接貼り付けるだけで簡単に保存でき、プレビュー表示やワンクリックでのコピー機能を備えています。また、Firebaseと連携し、IaC(Infrastructure as Code)によって構築されたセキュアなインフラストラクチャにより、個人利用における強固なセキュリティ要件を満たしています。

### 主な機能

- **リアルタイム保存:** Firestoreとの連携によるクラウド保存と自動同期。
- **インスタント・プレビュー:** 保存したSVGをグリッド一覧で即座に視覚化。
- **スマート・コピー:** ワンクリックでクリップボードへSVGコードを出力。
- **ダイナミック・キャンバス:** 背景色を自由に変更でき、白抜きアイコンなどの視認性を確保。
- **Docker対応:** 環境構築不要で、コンテナ上で即座に開発環境が立ち上がります。

## Demo Movie

https://github.com/user-attachments/assets/d714183d-87c3-4a9e-bd04-b973112b2491

## 使用技術 (Tech Stack)

| カテゴリ | 技術 |
| :--- | :--- |
| **Frontend** | React 19 (Vite, TypeScript) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Backend** | Firebase (Firestore, Authentication) |
| **Environment** | Docker / Docker Compose |
| **Tooling** | ESLint, PostCSS, Node.js (v20+) |

## 開発経緯

- きっかけは、LLMに開発に使えそうなSVGを出力してもらうなかで、SVGを一元管理したいと感じたことでした。
- 調べる中で、SVGを管理するツールは既にサービスとして存在していましたが、「SVGを保管」というシンプルな仕組みならば個人でも開発できるのではと考えてsvg-managerの開発を始めました。
- 現在は、「私個人の欲しい機能を好きに付けられるSVG管理ツール」として開発を行っています。

## svg-managerの有用性

#### **txtファイルでSVGを管理する際の問題点**

- SVGを.txtファイルを作成することで管理する場合、仮にヒューマンエラーでSVGコードを壊していてもすぐにはわかりません。
- また、LLMにSVGを作らせている前提を考えれば、ローカルでの管理ではSVGの管理コストがすぐに許容範囲を超えることが想定されます。

#### **svg-managerで解決できること**

- GUIを通して保存しているSVGを視覚的に一元管理できます。
- ユーザの張ったコードをもとにプレビューを表示するため、コードが壊れているかどうかの確認が容易です。
- クラウド上でSVGを管理しているため、ローカル上がSVG関連のファイルであふれることを避けられます。
- 自分のGoogleアカウントでのみログインできるサイトとして公開しているため、端末に左右されることなくSVGの管理を行えます。

## 既存のSVG管理ツールとの比較
既存のSVG管理ツールとの比較を、Gemini 3.1 proを使用して以下のファイルにまとめました。

[comparison-with-existing-svg-management-tools.md](docs/comparison-with-existing-svg-management-tools.md)

## ディレクトリ構成の意図

プロジェクトの保守性と拡張性を厳しく精査し、以下のディレクトリ構造を採用しています。

```text
svg-manager/
├── src/
│   ├── firebase.ts       # Firebaseの初期化と各サービスのExport。UIとロジックの分離。
│   ├── App.tsx           # メインのアプリケーションロジック。状態管理とビューを担当。
│   ├── main.tsx          # エントリーポイント。ReactのDOMマウント。
│   └── index.css         # Tailwind CSSのディレクティブ定義。
├── docs/
│   └── ARCHITECTURE.md   # アーキテクチャおよびインフラストラクチャ仕様。
├── scripts/
│   └── generate-rules.js # セキュリティルールの動的生成スクリプト。
├── Dockerfile            # 開発環境のコンテナイメージ定義。
├── docker-compose.yml    # ホットリロードや環境変数の注入を制御する実行設定。
├── .env.example          # FirebaseのAPIキー情報のテンプレート。
└── .gitignore            # セキュリティ事故を防ぐための厳格な除外設定。
```

### **構成のこだわり**

- **Firebase設定の独立**: `firebase.ts`に設定を隔離することで、APIキーの変更や初期化ロジックの修正が他へ影響を与えない設計。
- **Dockerベースの開発**: ローカルマシンの依存関係を排除し、`docker compose up` のみで開発環境を再現可能。Windows環境でのホットリロードにも対応。
- **セキュリティの担保**: `.env` をGit管理から完全に除外する設定を `.gitignore` で徹底。

## 認証とセキュリティ (Authentication & Security)
本アプリケーションは個人のアセット管理を目的とするため、第三者の不正アクセスを防ぐ強固なセキュリティ設定を施しています。

- **Googleログイン認証**: 
Googleアカウントを用いたOAuth認証を採用。デバイスやブラウザを変更しても自身のデータを安全に引き継いで管理可能です。
- **プライベートデータベース (アクセス制限)**: 
Firestoreのセキュリティルールを厳格に設定し、指定した特定の管理者UIDに対してのみデータの読み書きを許可しています。

## アーキテクチャとセキュリティ設計

本プロジェクトは、個人専用ツールとしての安全性を担保するため、以下の設計を採用しています。
詳細な仕様については [ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照してください。

- **認証ロックダウン**: 新規ユーザー登録を無効化し、特定の管理者UIDのみにアクセスを限定。
- **動的セキュリティルール**: デプロイ時に環境変数からUIDを注入し、`firestore.rules` を動的に生成。リポジトリへのシークレット漏洩を防止。
- **環境非依存の改行コード管理**: WindowsとDocker(Linux)間の互換性問題を排除するため、`.gitattributes` によるLF改行の強制。

## **セットアップ手順**

### **1\. Firebaseの設定**

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成する。
2. Firestore Database と Authentication (Google認証) を有効にする。
3. Identity Platformの設定から「新規ユーザー作成」機能を無効化します。
4. `.env.example` をコピーして `.env` を作成し、FirebaseのAPIキー情報および `FIREBASE_ADMIN_UID` を入力します。

### **2\. 起動 (Docker)**

Dockerが導入されている環境で以下を実行します。
```
docker compose up -d --build
```
起動後、ブラウザで http://localhost:5173 にアクセスしてください。

## デプロイ手順
デプロイ処理はFirebase CLIとNode.jsのネイティブスクリプトによって自動化されています。

コンテナ内部から以下のコマンドを実行することで、ルールの生成、ビルド、デプロイが順次実行されます。
```bash
# コンテナへのアクセス
docker compose exec -it app bash

# ルールの生成（Node.jsの --env-file オプションを使用）
npm run predeploy:rules

# デプロイの実行
npx firebase-tools deploy
```

## **ライセンス**

このプロジェクトは私用ソフトウェア兼ポートフォリオとして構築されています。
