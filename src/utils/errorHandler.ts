export const getFirebaseErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  // FirebaseErrorオブジェクトの形式か判定
  if (typeof error === "object" && error !== null && "code" in error) {
    const errorCode = (error as { code: string }).code;

    switch (errorCode) {
      case "permission-denied":
        return "権限エラー: この操作を実行する権限がありません（管理者のみアクセス可能です）。";
      case "unavailable":
        return "ネットワークエラー: サーバーに接続できません。通信環境をご確認ください。";
      case "auth/network-request-failed":
        return "ネットワークエラー: 認証に失敗しました。通信環境をご確認ください。";
      case "auth/popup-closed-by-user":
        return "ログイン操作がキャンセルされました。";
      case "auth/unauthorized-domain":
        return "権限エラー: このドメインからのアクセスは許可されていません。";
      case "not-found":
        return "エラー: 対象のデータが見つかりませんでした。";
      default:
        return `${fallbackMessage} (エラーコード: ${errorCode})`;
    }
  }

  // 標準のErrorオブジェクトの場合
  if (error instanceof Error) {
    return `${fallbackMessage}: ${error.message}`;
  }

  return fallbackMessage;
};
