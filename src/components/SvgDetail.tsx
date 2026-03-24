import React from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { SvgViewer } from "./SvgViewer";
import { SvgItem, ViewState } from "../types";

interface SvgDetailProps {
  svg: SvgItem | undefined;
  previewBgColor: string;
  setView: (view: ViewState) => void;
  copyToClipboard: (text: string) => void;
}

export const SvgDetail: React.FC<SvgDetailProps> = ({
  svg,
  previewBgColor,
  setView,
  copyToClipboard,
}) => {
  if (!svg) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => setView("list")}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-800 mb-8 font-bold transition-colors"
      >
        <ArrowLeft size={20} /> 一覧へ戻る
      </button>
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
    </div>
  );
};
