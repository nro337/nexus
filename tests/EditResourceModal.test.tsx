import { render, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import { EditResourceModal } from "../src/components/resources/EditResourceModal";
import type { Resource } from "../src/types";

vi.mock("../src/store/useResourceStore", () => ({
  useResourceStore: (selector: (s: { updateResource: () => void }) => unknown) =>
    selector({ updateResource: vi.fn() }),
}));

vi.mock("../src/db/resources", () => ({
  getResourceTags: vi.fn().mockResolvedValue([]),
  setResourceTags: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/components/capture/TagCombobox", () => ({
  TagCombobox: () => null,
}));

const mockResource: Resource = {
  id: "res-1",
  title: "Test Resource",
  url: "https://example.com",
  content: "",
  type: "link",
  source: "manual",
  createdAt: new Date(),
  updatedAt: new Date(),
  archived: false,
};

describe("EditResourceModal", () => {
  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(<EditResourceModal resource={mockResource} onClose={onClose} />);
    });

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other keys", async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(<EditResourceModal resource={mockResource} onClose={onClose} />);
    });

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Tab" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("removes the Escape key listener on unmount", async () => {
    const onClose = vi.fn();
    let unmount!: () => void;
    await act(async () => {
      ({ unmount } = render(
        <EditResourceModal resource={mockResource} onClose={onClose} />
      ));
    });

    unmount();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
