import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import { ResourceCard } from "../src/components/resources/ResourceCard";
import type { Resource } from "../src/types";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockArchive = vi.fn();
const mockUnarchive = vi.fn();
const mockRemove = vi.fn();

// useResourceStore can be called with or without a selector
vi.mock("../src/store/useResourceStore", () => ({
  useResourceStore: (selector?: (s: unknown) => unknown) => {
    const state = {
      archiveResource: mockArchive,
      unarchiveResource: mockUnarchive,
      removeResource: mockRemove,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("../src/db/tags", () => ({
  getTagsForResource: vi.fn().mockResolvedValue([]),
}));

vi.mock("../src/lib/utils", () => ({
  formatRelativeDate: () => "just now",
  generateId: () => "test-id",
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "res-1",
    title: "Test Resource",
    content: "",
    type: "link",
    source: "manual",
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ResourceCard", () => {
  beforeEach(() => {
    mockArchive.mockReset();
    mockUnarchive.mockReset();
    mockRemove.mockReset();
  });

  it("renders the resource title", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource({ title: "My Link" })} />);
    });
    expect(screen.getByText("My Link")).toBeInTheDocument();
  });

  it("renders a link when url is provided", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource({ url: "https://example.com" })} />);
    });
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://example.com");
  });

  it("renders plain title text when no url is provided", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource({ url: undefined })} />);
    });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Test Resource")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    const resource = makeResource();
    await act(async () => {
      render(<ResourceCard resource={resource} onEdit={onEdit} />);
    });
    fireEvent.click(screen.getByTitle(/edit/i));
    expect(onEdit).toHaveBeenCalledWith(resource);
  });

  it("calls archiveResource when archive button is clicked (non-archived resource)", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource({ archived: false })} />);
    });
    fireEvent.click(screen.getByTitle(/archive/i));
    expect(mockArchive).toHaveBeenCalledWith("res-1");
  });

  it("calls unarchiveResource when unarchive button is clicked (archived resource)", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource({ archived: true })} />);
    });
    fireEvent.click(screen.getByTitle(/unarchive/i));
    expect(mockUnarchive).toHaveBeenCalledWith("res-1");
  });

  it("calls removeResource when delete button is clicked", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource()} />);
    });
    fireEvent.click(screen.getByTitle(/delete/i));
    expect(mockRemove).toHaveBeenCalledWith("res-1");
  });

  it("calls onSelect when card is clicked", async () => {
    const onSelect = vi.fn();
    const resource = makeResource();
    await act(async () => {
      render(<ResourceCard resource={resource} onSelect={onSelect} />);
    });
    fireEvent.click(screen.getByText("Test Resource"));
    expect(onSelect).toHaveBeenCalledWith(resource);
  });

  it("shows YouTube iframe embed for youtube.com URLs", async () => {
    await act(async () => {
      render(
        <ResourceCard
          resource={makeResource({ url: "https://www.youtube.com/watch?v=abc123" })}
        />
      );
    });
    expect(document.querySelector("iframe")).toBeInTheDocument();
    expect(document.querySelector("iframe")?.src).toContain("youtube.com/embed/abc123");
  });

  it("shows YouTube iframe embed for youtu.be short URLs", async () => {
    await act(async () => {
      render(
        <ResourceCard resource={makeResource({ url: "https://youtu.be/xyz789" })} />
      );
    });
    expect(document.querySelector("iframe")?.src).toContain("youtube.com/embed/xyz789");
  });

  it("shows thumbnail image when thumbnail URL is present", async () => {
    await act(async () => {
      render(
        <ResourceCard
          resource={makeResource({ thumbnail: "https://example.com/img.png" })}
        />
      );
    });
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/img.png");
  });

  it("hides thumbnail on image load error", async () => {
    await act(async () => {
      render(
        <ResourceCard
          resource={makeResource({ thumbnail: "https://example.com/broken.png" })}
        />
      );
    });
    const img = screen.getByRole("img");
    await act(async () => {
      fireEvent.error(img);
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders 'show more' button for long content and toggles expand", async () => {
    const longContent = "A".repeat(200);
    await act(async () => {
      render(<ResourceCard resource={makeResource({ content: longContent })} />);
    });
    const showMore = screen.getByText(/show more/i);
    expect(showMore).toBeInTheDocument();

    fireEvent.click(showMore);
    expect(screen.getByText(/show less/i)).toBeInTheDocument();
  });

  it("does not render 'show more' button for short content", async () => {
    await act(async () => {
      render(<ResourceCard resource={makeResource({ content: "Short content" })} />);
    });
    expect(screen.queryByText(/show more/i)).not.toBeInTheDocument();
  });
});
