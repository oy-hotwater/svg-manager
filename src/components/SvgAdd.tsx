import React from "react";
import { ArrowLeft, Code } from "lucide-react";
import { SvgViewer } from "./SvgViewer";
import { ViewState } from "../types";

interface SvgAddProps {
  newSvgName: string;
  setNewSvgName: (name: string) => void;
  newSvgCode: string;
  setNewSvgCode: (code: string) => void;
  previewBgColor: string;
  handleSave: () => void;
  setView: (view: ViewState) => void;
}

export const SvgAdd: React.FC<SvgAddProps> = ({
  newSvgName,
  setNewSvgName,
  newSvgCode,
  setNewSvgCode,
  previewBgColor,
  handleSave,
  setView,
}) => (
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
            onChange={(e) => setNewSvgName(e.target.value)}
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
            onChange={(e) => setNewSvgCode(e.target.value)}
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
                <p className="text-sm font-medium">コードを入力してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
