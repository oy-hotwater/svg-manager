# **SVG Manager README Drafted by Gemini**

## **概要**

**SVG Manager** は、開発やデザインで頻繁に利用するSVGアセットをクラウド上で一元管理するための自分専用ソフトウェアです。

ブラウザからSVGコードを直接貼り付けるだけで簡単に保存でき、プレビュー表示やワンクリックでのコピー機能を備えています。

### **主な機能**

* **リアルタイム保存:** Firestoreとの連携によるクラウド保存と自動同期。  
* **インスタント・プレビュー:** 保存したSVGをグリッド一覧で即座に視覚化。  
* **スマート・コピー:** ワンクリックでクリップボードへSVGコードを出力。  
* **ダイナミック・キャンバス:** 背景色を自由に変更でき、白抜きアイコンなどの視認性を確保。  
* **Docker対応:** 環境構築不要で、コンテナ上で即座に開発環境が立ち上がります。

## **Demo Movie**

https://github.com/user-attachments/assets/d714183d-87c3-4a9e-bd04-b973112b2491

## **使用技術 (Tech Stack)**

| カテゴリ | 技術 |
| :---- | :---- |
| **Frontend** | React (Vite) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Backend** | Firebase (Firestore, Authentication) |
| **Environment** | Docker / Docker Compose |
| **CI/CD / Tooling** | ESLint, PostCSS |

## **ディレクトリ構成の意図**

プロジェクトの保守性と拡張性を「厳しく精査」し、以下のディレクトリ構造を採用しています。

svg-manager/  
├── src/  
│   ├── firebase.js  \# Firebaseの初期化と各サービスのExport。UIとロジックの分離。  
│   ├── App.jsx      \# メインのアプリケーションロジック。状態管理とビューを担当。  
│   ├── main.jsx     \# エントリーポイント。ReactのDOMマウント。  
│   └── index.css    \# Tailwind CSSのディレクティブ定義。    
├── Dockerfile       \# 開発環境のコンテナイメージ定義。  
├── docker-compose.yml \# ホットリロードや環境変数の注入を制御する実行設定。  
├── .env.example     \# FirebaseのAPIキー情報のテンプレート。  
└── .gitignore       \# セキュリティ事故を防ぐための厳格な除外設定。

### **構成のこだわり**

* **firebase.js の独立:** Firebaseの設定を1ファイルに隔離することで、APIキーの変更や初期化ロジックの修正が他のコードに影響を与えないように設計されています。  
* **Dockerベースの開発:** ローカルマシンのNode.jsバージョンに依存せず、docker compose up だけで誰でも同じ環境を再現できます。  
* **セキュリティの担保:** .env を Git から完全に除外する設定を .gitignore で徹底し、セキュリティ事故を未然に防いでいます。

## **セットアップ手順**

### **1\. Firebaseの設定**

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成します。  
2. Firestore Database と Authentication（匿名認証）を有効にします。  
3. .env.example をコピーして .env を作成し、FirebaseのAPIキー情報を入力します。

### **2\. 起動 (Docker)**

Dockerが導入されている環境で以下を実行します。

docker compose up \-d \--build

起動後、ブラウザで http://localhost:5173 にアクセスしてください。

## **ライセンス**

このプロジェクトは私用ソフトウェアとして構築されています。
