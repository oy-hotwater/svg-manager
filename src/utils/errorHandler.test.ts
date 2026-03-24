import { describe, it, expect } from "vitest";
import { getFirebaseErrorMessage } from "./errorHandler";

describe("getFirebaseErrorMessage", () => {
  it("permission-deniedエラーの場合、適切なメッセージを返すこと", () => {
    const error = { code: "permission-denied" };
    expect(getFirebaseErrorMessage(error, "フォールバック")).toBe(
      "権限エラー: この操作を実行する権限がありません（管理者のみアクセス可能です）。",
    );
  });

  it("未知のFirebaseエラーコードの場合、フォールバックとコードを返すこと", () => {
    const error = { code: "unknown-code" };
    expect(getFirebaseErrorMessage(error, "フォールバック")).toBe(
      "フォールバック (エラーコード: unknown-code)",
    );
  });

  it("標準のErrorオブジェクトの場合、メッセージを結合して返すこと", () => {
    const error = new Error("標準エラー");
    expect(getFirebaseErrorMessage(error, "フォールバック")).toBe(
      "フォールバック: 標準エラー",
    );
  });
});
