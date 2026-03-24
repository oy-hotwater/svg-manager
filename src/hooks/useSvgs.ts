import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { SvgItem } from "../types";

export const useSvgs = (userId: string | undefined) => {
  const [svgs, setSvgs] = useState<SvgItem[]>([]);
  const [isSvgsLoading, setIsSvgsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setSvgs([]);
      setIsSvgsLoading(false);
      return;
    }

    setIsSvgsLoading(true);
    const svgsRef = collection(db, "users", userId, "svgs");
    const unsubscribe = onSnapshot(
      svgsRef,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SvgItem[];

        setSvgs(
          data.sort((a, b) => {
            const getMillis = (val: any): number => {
              if (!val) return Date.now();
              return val.toDate ? val.toDate().getTime() : Number(val);
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
          }),
        );
        setIsSvgsLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setIsSvgsLoading(false);
      },
    );
    return () => unsubscribe();
  }, [userId]);

  const addSvg = async (name: string, code: string): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    const id = crypto.randomUUID();
    await setDoc(doc(db, "users", userId, "svgs", id), {
      name: name.trim() || "Untitled",
      code: code.trim(),
      createdAt: serverTimestamp(),
    });
  };

  const removeSvg = async (svgId: string): Promise<void> => {
    if (!userId) throw new Error("User not authenticated");
    await deleteDoc(doc(db, "users", userId, "svgs", svgId));
  };

  return { svgs, isSvgsLoading, addSvg, removeSvg };
};
