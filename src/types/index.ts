import { Timestamp, FieldValue } from "firebase/firestore";

export interface SvgItem {
  id: string;
  name: string;
  code: string;
  createdAt: Timestamp | FieldValue | number | null;
}

// UI（コンポーネント）層で扱う加工済みデータの型
export interface SvgItem {
  id: string;
  name: string;
  code: string;
  createdAt: Date | null;
}

export type ViewState = "list" | "add" | "detail";
