# 開発環境用設定
FROM node:20-slim

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# Viteのデフォルトポート
EXPOSE 5173

# 開発サーバーの起動
CMD ["npm", "run", "dev"]