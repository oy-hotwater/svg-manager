import React, { useState } from "react";
import {
  Palette,
  Image as ImageIcon,
  AlertTriangle,
  CloudOff,
  Check,
} from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useSvgs } from "./hooks/useSvgs";
import { SvgList } from "./components/SvgList";
import { SvgAdd } from "./components/SvgAdd";
import { SvgDetail } from "./components/SvgDetail";
import { ViewState } from "./types";
import { getFirebaseErrorMessage } from "./utils/errorHandler";

export default function App() {
  const { user, isAuthLoading, loginWithGoogle, logout } = useAuth();
  // エラーを取り出す
  const {
    svgs,
    isSvgsLoading,
    error: svgsError,
    addSvg,
    removeSvg,
  } = useSvgs(user?.uid);

  const [view, setView] = useState<ViewState>("list");
  const [selectedSvgId, setSelectedSvgId] = useState<string | null>(null);
  const [previewBgColor, setPreviewBgColor] = useState<string>("#f3f4f6");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [newSvgName, setNewSvgName] = useState<string>("");
  const [newSvgCode, setNewSvgCode] = useState<string>("");

  const showToast = (m: string): void => {
    setToastMessage(m);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (
    text: string,
    e?: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    if (e) e.stopPropagation();
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("コピーしました！"))
      .catch((err) => console.error("Copy failed", err));
  };

  const handleSave = async (): Promise<void> => {
    // UI側のボタン非活性と合わせて、ロジック層でも厳密にブロックする
    if (!newSvgName.trim() || !newSvgCode.trim()) {
      showToast("アセット名とSVGコードを入力してください");
      return;
    }

    try {
      await addSvg(newSvgName, newSvgCode);
      setView("list");
      setNewSvgName("");
      setNewSvgCode("");
      showToast("保存しました");
    } catch (err) {
      // ユーティリティ経由で詳細なエラーを表示
      showToast(getFirebaseErrorMessage(err, "保存に失敗しました"));
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteTargetId) return;
    try {
      await removeSvg(deleteTargetId);
      if (selectedSvgId === deleteTargetId) setView("list");
      setDeleteTargetId(null);
      showToast("削除しました");
    } catch (err) {
      // ユーティリティ経由で詳細なエラーを表示
      showToast(getFirebaseErrorMessage(err, "削除に失敗しました"));
    }
  };

  // ログイン処理のエラーハンドリング
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      showToast(getFirebaseErrorMessage(err, "ログインに失敗しました"));
    }
  };

  const isLoading = isAuthLoading || (user && isSvgsLoading);

  // ログアウト処理のエラーハンドリング
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      showToast(getFirebaseErrorMessage(err, "ログアウトに失敗しました"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100 font-sans">
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView("list")}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <ImageIcon className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-800">
            SVG Manager
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            <Palette size={16} className="text-gray-500" />
            <input
              type="color"
              value={previewBgColor}
              onChange={(e) => setPreviewBgColor(e.target.value)}
              className="w-6 h-6 cursor-pointer border-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="user"
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-xs font-bold text-gray-700">
                  {user.displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <>
                <CloudOff size={16} className="text-red-400" />
                <span className="text-xs font-bold text-red-500">Offline</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Firestoreの同期エラー（権限不足やネットワーク切断）を画面上部に表示 */}
        {svgsError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <p className="text-red-700 font-bold text-sm">{svgsError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">データを同期中...</p>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-32">
            <h2 className="text-2xl font-black text-gray-800 mb-6">
              ログインが必要です
            </h2>
            <button
              onClick={handleLogin}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-sm hover:bg-gray-50 transition-all"
            >
              Googleでログイン
            </button>
          </div>
        ) : view === "list" ? (
          <SvgList
            svgs={svgs}
            previewBgColor={previewBgColor}
            setView={setView}
            setSelectedSvgId={setSelectedSvgId}
            setDeleteTargetId={setDeleteTargetId}
            copyToClipboard={copyToClipboard}
          />
        ) : view === "add" ? (
          <SvgAdd
            newSvgName={newSvgName}
            setNewSvgName={setNewSvgName}
            newSvgCode={newSvgCode}
            setNewSvgCode={setNewSvgCode}
            previewBgColor={previewBgColor}
            handleSave={handleSave}
            setView={setView}
          />
        ) : (
          <SvgDetail
            svg={svgs.find((s) => s.id === selectedSvgId)}
            previewBgColor={previewBgColor}
            setView={setView}
            copyToClipboard={copyToClipboard}
          />
        )}
      </main>

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-5 rounded-full text-red-600 mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                SVGを削除しますか？
              </h3>
              <p className="text-gray-500 mt-3 text-sm">
                この操作は取り消せません。クラウドからも削除されます。
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-10">
              <button
                onClick={confirmDelete}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all"
              >
                削除を確定する
              </button>
              <button
                onClick={() => setDeleteTargetId(null)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-green-500 p-1 rounded-full">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
          <span className="font-black text-sm uppercase tracking-widest">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}
