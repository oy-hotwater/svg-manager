import React, { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  ArrowLeft,
  Check,
  Palette,
  Trash2,
  Image as ImageIcon,
  Code,
  AlertTriangle,
  Cloud,
  CloudOff,
} from "lucide-react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * SvgViewer Component
 * コンポーネントの再生成を防ぐため、Appコンポーネントの外側で定義します。
 */
const SvgViewer = ({ code, bgColor, className = "" }) => (
  <div
    className={`flex items-center justify-center overflow-hidden ${className} [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full`}
    style={{ backgroundColor: bgColor }}
    dangerouslySetInnerHTML={{ __html: code }}
  />
);

export default function App() {
  const [view, setView] = useState("list");
  const [svgs, setSvgs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedSvgId, setSelectedSvgId] = useState(null);
  const [previewBgColor, setPreviewBgColor] = useState("#f3f4f6");
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [newSvgName, setNewSvgName] = useState("");
  const [newSvgCode, setNewSvgCode] = useState("");

  // 1. 匿名認証のセットアップ
  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. ユーザー固有のデータ同期 (Firestore)
  useEffect(() => {
    if (!user) return;

    // パス: users/{uid}/svgs
    const svgsRef = collection(db, "users", user.uid, "svgs");

    const unsubscribe = onSnapshot(
      svgsRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // 作成日時順にソートしてステートを更新
        setSvgs(data.sort((a, b) => b.createdAt - a.createdAt));
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore Fetch Error:", err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // ユーティリティ: 通知表示
  const showToast = (m) => {
    setToastMessage(m);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ユーティリティ: コピー処理 (Modern API)
  const copyToClipboard = (text, e = null) => {
    if (e) e.stopPropagation();
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("コピーしました！"))
      .catch((err) => console.error("Copy failed", err));
  };

  // ハンドラー: 新規保存
  const handleSave = async () => {
    if (!newSvgCode.trim() || !user) return;

    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, "users", user.uid, "svgs", id), {
        name: newSvgName.trim() || "Untitled",
        code: newSvgCode.trim(),
        createdAt: Date.now(),
      });
      setView("list");
      setNewSvgName("");
      setNewSvgCode("");
      showToast("保存しました");
    } catch (err) {
      console.error("Save Error:", err);
      showToast("保存に失敗しました");
    }
  };

  // ハンドラー: 削除確定
  const confirmDelete = async () => {
    if (!deleteTargetId || !user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "svgs", deleteTargetId));
      if (selectedSvgId === deleteTargetId) setView("list");
      setDeleteTargetId(null);
      showToast("削除しました");
    } catch (err) {
      console.error("Delete Error:", err);
      showToast("削除に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100">
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView("list")}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg">
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
              <>
                <Cloud size={16} className="text-green-500" />
                <span className="text-xs font-bold text-green-700">Synced</span>
              </>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">
              データを読み込み中...
            </p>
          </div>
        ) : view === "list" ? (
          <>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-800">
                  Collection
                </h2>
                <p className="text-gray-500 mt-1">
                  {svgs.length} 個のアイテムを保管中
                </p>
              </div>
              <button
                onClick={() => setView("add")}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <Plus size={20} strokeWidth={3} />
                新規追加
              </button>
            </div>

            {svgs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-32 flex flex-col items-center text-center">
                <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-300">
                  <ImageIcon size={64} />
                </div>
                <h3 className="text-xl font-bold text-gray-700">
                  保存されたSVGがありません
                </h3>
                <p className="text-gray-400 mt-2 max-w-xs px-6">
                  コードを貼り付けて、あなただけのSVGライブラリを構築しましょう。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {svgs.map((svg) => (
                  <div
                    key={svg.id}
                    onClick={() => {
                      setSelectedSvgId(svg.id);
                      setView("detail");
                    }}
                    className="group bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-2xl hover:border-blue-300 transition-all relative flex flex-col"
                  >
                    <SvgViewer
                      code={svg.code}
                      bgColor={previewBgColor}
                      className="aspect-square rounded-xl mb-4 shadow-sm group-hover:scale-[1.02] transition-transform"
                    />
                    <p className="font-bold truncate text-sm text-gray-800 px-1">
                      {svg.name}
                    </p>
                    <p className="text-[10px] text-gray-400 px-1 mt-1 font-mono uppercase">
                      {new Date(svg.createdAt).toLocaleDateString()}
                    </p>

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                      <button
                        onClick={(e) => copyToClipboard(svg.code, e)}
                        className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black shadow-xl"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(svg.id);
                        }}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-xl"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : view === "add" ? (
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-800 mb-8 font-bold transition-colors"
            >
              <ArrowLeft size={20} /> 戻る
            </button>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    value={newSvgName}
                    onChange={(e) => setNewSvgName(e.target.value)}
                    placeholder="例: Arrow Icon"
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                    SVG Code
                  </label>
                  <textarea
                    value={newSvgCode}
                    onChange={(e) => setNewSvgCode(e.target.value)}
                    placeholder="<svg>...</svg>"
                    className="w-full h-80 p-5 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-mono text-xs leading-relaxed shadow-sm resize-none"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={!newSvgCode.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-30 transition-all active:scale-[0.98]"
                >
                  貼り付け ＆ 保存する
                </button>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                  Live Preview
                </label>
                <div className="flex-1 bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-inner flex flex-col min-h-[400px]">
                  <div className="flex-1 flex items-center justify-center rounded-2xl overflow-hidden border-2 border-dashed border-gray-50 relative">
                    {newSvgCode.trim() ? (
                      <SvgViewer
                        code={newSvgCode}
                        bgColor={previewBgColor}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="text-center space-y-3">
                        <Code size={48} className="mx-auto text-gray-100" />
                        <p className="text-gray-300 text-sm font-medium italic">
                          Waiting for input...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-800 mb-8 font-bold transition-colors"
            >
              <ArrowLeft size={20} /> 戻る
            </button>
            {(() => {
              const svg = svgs.find((s) => s.id === selectedSvgId);
              return svg ? (
                <div className="grid lg:grid-cols-2 gap-12 h-[65vh]">
                  <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col shadow-sm">
                    <h3 className="text-2xl font-black text-gray-800 mb-8 truncate uppercase tracking-tight">
                      {svg.name}
                    </h3>
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl overflow-hidden shadow-inner">
                      <SvgViewer
                        code={svg.code}
                        bgColor={previewBgColor}
                        className="w-full h-full p-12"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/40">
                      <span className="text-gray-500 text-xs font-mono uppercase tracking-widest px-2">
                        Source View
                      </span>
                      <button
                        onClick={() => copyToClipboard(svg.code)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all"
                      >
                        <Copy size={14} /> COPY CODE
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={svg.code}
                      className="flex-1 bg-transparent text-gray-400 p-8 font-mono text-[11px] leading-relaxed resize-none outline-none selection:bg-blue-500/30"
                    />
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </main>

      {/* MODAL: 削除確認 */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-5 rounded-full text-red-600 mb-6">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                SVGを削除しますか？
              </h3>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                この操作は取り消せません。クラウド上のデータも完全に消去されます。
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-10">
              <button
                onClick={confirmDelete}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98]"
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

      {/* TOAST: フィードバック */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
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
