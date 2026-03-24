import React from "react";

interface SvgViewerProps {
  code: string;
  bgColor: string;
  className?: string;
}

export const SvgViewer: React.FC<SvgViewerProps> = ({
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
