import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SvgViewer } from "./SvgViewer";

describe("SvgViewer", () => {
  it("指定されたコードと背景色で正しくレンダリングされること", () => {
    const code = '<svg data-testid="test-svg"></svg>';
    const bgColor = "#ffffff";

    const { container } = render(<SvgViewer code={code} bgColor={bgColor} />);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ backgroundColor: bgColor });
    expect(div.innerHTML).toContain(code);
  });
});
