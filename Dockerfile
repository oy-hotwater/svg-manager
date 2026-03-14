# 厳選された開発・実行用マルチステージビルド

# ステージ1: 依存関係のインストールとビルド
FROM node:20-slim AS builder

WORKDIR /app

# キャッシュ効率化のため、まずpackage.jsonのみコピー
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# ステージ2: 開発環境としての実行（ホットリロード対応）
# 本番用にはNginxステージを別途追加可能ですが、開発利便性を優先
EXPOSE 5173

CMD ["npm", "run", "dev"]