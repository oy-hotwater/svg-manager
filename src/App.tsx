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
  CloudOff,
} from "lucide-react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp, // Firebaseのサーバー時刻を使用する
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// ==========================================
// Type Definitions
// ==========================================

interface SvgItem {
  id: string;
  name: string;
  code: string;
  // FirestoreのTimestamp、保存直後のFieldValue、または互換用の数値を許容
  createdAt: Timestamp | FieldValue | number | null | any;
}

interface SvgViewerProps {
  code: string;
  bgColor: string;
  className?: string;
}

type ViewState = "list" | "add" | "detail";

// ==========================================
// Components
// ==========================================

/**
 * SvgViewer Component
 */
const SvgViewer: React.FC<SvgViewerProps> = ({
  code,
  bgColor,
  className = "",
}) => (
  <div
    className={`flex items-center justify-center overflow-hidden ${className} [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full`}
    style={{ backgroundColor: bgColor }}
    dangerouslySetInnerHTML={{ __html: code }}
  />
);

export default function App() {
  // 厳格な型指定を追加
  const [view, setView] = useState<ViewState>("list");
  const [svgs, setSvgs] = useState<SvgItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedSvgId, setSelectedSvgId] = useState<string | null>(null);
  const [previewBgColor, setPreviewBgColor] = useState<string>("#f3f4f6");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [newSvgName, setNewSvgName] = useState<string>("");
  const [newSvgCode, setNewSvgCode] = useState<string>("");

  // ログイン状態の監視のみを行う
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
      setIsLoading(false); // ユーザーの有無に関わらずローディングを解除
    });
    return () => unsubscribe();
  }, []);

  // Googleログイン処理
  const loginWithGoogle = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Error:", err);
      showToast("ログインに失敗しました");
    }
  };

  // ログアウト処理
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setSvgs([]); // ログアウト時に画面のデータをクリア
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    const svgsRef = collection(db, "users", user.uid, "svgs");
    const unsubscribe = onSnapshot(
      svgsRef,
      (snap) => {
        // d.data() の戻り値を明示的にキャストして型安全を確保
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SvgItem[];

        // 既存データ(Date.now()による数値)と新規データ(Timestamp)の両方に対応したソート
        setSvgs(
          data.sort((a, b) => {
            const getMillis = (val: any): number => {
              if (!val) return Date.now(); // サーバー保存待ち(pending)の時は最新として扱う
              return val.toDate ? val.toDate().getTime() : Number(val);
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
          }),
        );
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setIsLoading(false);
      },
    );
    return () => unsubscribe();
  }, [user]);

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
    if (!newSvgCode.trim() || !user) return;
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, "users", user.uid, "svgs", id), {
        name: newSvgName.trim() || "Untitled",
        code: newSvgCode.trim(),
        createdAt: serverTimestamp(),
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

  const confirmDelete = async (): Promise<void> => {
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPreviewBgColor(e.target.value)
              }
              className="w-6 h-6 cursor-pointer border-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            {user ? (
              <div className="flex items-center gap-3">
                {/* ユーザーのアイコンと名前を表示 */}
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
                  onClick={logout}
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">データを同期中...</p>
          </div>
        ) : !user ? (
          // 未ログイン時の画面
          <div className="flex flex-col items-center justify-center py-32">
            <h2 className="text-2xl font-black text-gray-800 mb-6">
              ログインが必要です
            </h2>
            <button
              onClick={loginWithGoogle}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-sm hover:bg-gray-50 transition-all"
            >
              Googleでログイン
            </button>
          </div>
        ) : view === "list" ? (
          // SVG一覧画面
          <>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                  Collection
                </h2>
                <p className="text-gray-500 mt-1">
                  {svgs.length} assets stored in cloud
                </p>
              </div>
              <button
                onClick={() => setView("add")}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                <Plus size={20} strokeWidth={3} /> 新規追加
              </button>
            </div>

            {svgs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-32 flex flex-col items-center text-center">
                <ImageIcon size={64} className="text-gray-200 mb-6" />
                <h3 className="text-xl font-bold text-gray-700">
                  SVGがまだありません
                </h3>
                <p className="text-gray-400 mt-2 max-w-xs px-6">
                  右上のボタンから最初のSVGを保存しましょう。
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
                    className="group bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-2xl hover:border-blue-200 transition-all relative flex flex-col"
                  >
                    <SvgViewer
                      code={svg.code}
                      bgColor={previewBgColor}
                      className="aspect-square rounded-xl mb-4 shadow-inner"
                    />
                    <p className="font-bold truncate text-sm text-gray-700 px-1">
                      {svg.name}
                    </p>
                    <p className="text-[10px] text-gray-400 px-1 mt-1 font-mono">
                      {/* createdAtがまだ無い（保存直後）ケースのフォールバック */}
                      {svg.createdAt &&
                      typeof svg.createdAt.toDate === "function"
                        ? svg.createdAt.toDate().toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => copyToClipboard(svg.code, e)}
                        className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black shadow-lg"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(svg.id);
                        }}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
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
              <ArrowLeft size={20} /> 一覧へ戻る
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewSvgName(e.target.value)
                    }
                    placeholder="例: Home Icon"
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                    SVG Code
                  </label>
                  <textarea
                    value={newSvgCode}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewSvgCode(e.target.value)
                    }
                    placeholder="<svg>...</svg>"
                    className="w-full h-80 p-5 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-mono text-xs leading-relaxed shadow-sm resize-none"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={!newSvgCode.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 disabled:opacity-30 transition-all active:scale-[0.98]"
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
                      <div className="text-center text-gray-200">
                        <Code size={48} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          コードを入力してください
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
              <ArrowLeft size={20} /> 一覧へ戻る
            </button>
            {(() => {
              const svg = svgs.find((s) => s.id === selectedSvgId);
              return svg ? (
                <div className="grid lg:grid-cols-2 gap-12 h-[65vh]">
                  <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col shadow-sm">
                    <h3 className="text-2xl font-black text-gray-800 mb-8 truncate tracking-tight">
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
                        Source
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

      {/* 削除確認ダイアログ */}
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
