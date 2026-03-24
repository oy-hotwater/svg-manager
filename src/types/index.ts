import { Timestamp, FieldValue } from "firebase/firestore";

export interface SvgItem {
  id: string;
  name: string;
  code: string;
  createdAt: Timestamp | FieldValue | number | null | any;
}

export type ViewState = "list" | "add" | "detail";
