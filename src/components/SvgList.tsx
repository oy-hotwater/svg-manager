import React from "react";
import { Plus, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { SvgViewer } from "./SvgViewer";
import { SvgItem, ViewState } from "../types";

interface SvgListProps {
  svgs: SvgItem[];
  previewBgColor: string;
  setView: (view: ViewState) => void;
  setSelectedSvgId: (id: string) => void;
  setDeleteTargetId: (id: string) => void;
  copyToClipboard: (
    text: string,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

export const SvgList: React.FC<SvgListProps> = ({
  svgs,
  previewBgColor,
  setView,
  setSelectedSvgId,
  setDeleteTargetId,
  copyToClipboard,
}) => {
  return (
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
                {svg.createdAt
                  ? svg.createdAt.toLocaleDateString()
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
  );
};
