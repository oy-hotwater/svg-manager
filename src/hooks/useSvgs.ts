import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { SvgItem, SvgDocument } from "../types";
import { getFirebaseErrorMessage } from "../utils/errorHandler"; // ユーティリティをインポート

export const useSvgs = (userId: string | undefined) => {
  const [svgs, setSvgs] = useState<SvgItem[]>([]);
  const [isSvgsLoading, setIsSvgsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // エラー状態を追加

  useEffect(() => {
    if (!userId) {
      setSvgs([]);
      setIsSvgsLoading(false);
      return;
    }

    setIsSvgsLoading(true);
    setError(null); // 初期化時にエラーをクリア

    const svgsRef = collection(db, "users", userId, "svgs");
    const unsubscribe = onSnapshot(
      svgsRef,
      (snap) => {
        const data: SvgItem[] = snap.docs.map((d) => {
          const rawData = d.data() as SvgDocument;

          // TimestampからData型への安全な変換
          let parsedDate: Date | null = null;
          if (rawData.createdAt instanceof Timestamp) {
            parsedDate = rawData.createdAt.toDate();
          } else if (rawData.createdAt) {
            // FieldValue（serverTimestamp）など、ローカルキャッシュ適用前の暫定対応
            parsedDate = new Date();
          }

          return {
            id: d.id,
            name: rawData.name,
            code: rawData.code,
            createdAt: parsedDate,
          };
        });

        setSvgs(
          data.sort((a, b) => {
            const getTime = (val: Date | null): number => {
              return val ? val.getTime() : Date.now();
            };
            return getTime(b.createdAt) - getTime(a.createdAt);
          }),
        );
        setError(null); // 正常に取得できた場合はエラーをクリア
        setIsSvgsLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        // エラーコードに応じて適切なメッセージをセット
        setError(getFirebaseErrorMessage(err, "データの同期に失敗しました"));
        setIsSvgsLoading(false);
      },
    );
    return () => unsubscribe();
  }, [userId]);

  const addSvg = async (name: string, code: string): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    const id = crypto.randomUUID();
    const newDoc: SvgDocument = {
      name: name.trim() || "untitled",
      code: code.trim(),
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", userId, "svgs", id), newDoc);
  };

  const removeSvg = async (svgId: string): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    await deleteDoc(doc(db, "users", userId, "svgs", svgId));
  };

  return { svgs, isSvgsLoading, error, addSvg, removeSvg };
};
