# Vite + Vitest環境における vite.config.ts の型エラー解決方法

## 概要

ViteプロジェクトにVitestを導入し、`vite.config.ts` にテスト用の設定を追加した際に発生するTypeScriptの型エラーと、その確実な解決策について記述します。

## 事象

`vite.config.ts` 内の `defineConfig` に `test` プロパティを追記すると、TypeScriptのコンパイル時またはエディタ上で以下のエラーが発生します。

```text
No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'test' does not exist in type 'UserConfigExport'.
```

## 原因

このエラーは、Viteの標準パッケージである `vite` からインポートした `defineConfig` が期待する型定義（`UserConfigExport`）の中に、Vitest固有の設定である `test` プロパティが含まれていないことに起因します。

TypeScriptは、定義されていない未知のプロパティがオブジェクトリテラルに指定されたことを厳格に検知し、エラーとして報告しています。

## 解決策

`defineConfig` のインポート元を `vite` から `vitest/config` に変更します。

### 修正前（エラーが発生するコード）

```typescript
import { defineConfig } from "vite"; // 原因となるインポート
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // 型定義が存在しないためエラーとなる
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

### 修正後（正しいコード）

```typescript
import { defineConfig } from "vitest/config"; // インポート元を変更
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // エラーが解消される
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

## 解説

`vitest/config` からインポートされる `defineConfig` は、Viteの標準的な設定項目に加えて、Vitestのテスト設定の型定義を包含した拡張版となっています。これにより、TypeScriptコンパイラが `test` プロパティの存在と内部の構造を正確に認識できるようになります。

この変更は機能面においてVite標準の `defineConfig` と完全な互換性を維持しています。そのため、開発サーバーの起動 (`vite dev`) やプロダクションビルド (`vite build`) といったVite本来の処理や、Dockerコンテナ上での実行環境に悪影響を及ぼすことはありません。

### 補足：トリプルスラッシュ・ディレクティブについて

ファイルの先頭に `/// <reference types="vitest" />` を記述することで型を拡張する手法も存在します。しかし、TypeScriptのバージョン、`tsconfig.json` の設定、または開発環境（エディタの言語サーバー等）によっては、このディレクティブが正しく解釈されず型エラーが継続するケースがあります。インポート元を変更する本手法のほうが、環境への依存が少なく、より確実な解決策となります。
