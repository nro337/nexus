import { vi } from "vitest";
import { getYouTubeThumbnailUrl, extractUrlMetadata, detectSource } from "../src/lib/metadata";

function mockFetch(html: string) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(html) }));
}

function mockFetchFail() {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
}

describe("extractUrlMetadata", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns YouTube thumbnail from fallback when all fetches fail", async () => {
    mockFetchFail();
    const result = await extractUrlMetadata("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(result.thumbnail).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns og:image when fetch succeeds", async () => {
    mockFetch(`<html><head>
      <meta property="og:title" content="Test Page" />
      <meta property="og:image" content="https://example.com/thumb.jpg" />
    </head></html>`);
    const result = await extractUrlMetadata("https://example.com/article");
    expect(result.thumbnail).toBe("https://example.com/thumb.jpg");
    expect(result.title).toBe("Test Page");
  });

  it("falls back to YouTube thumbnail even when fetch succeeds but og:image is missing", async () => {
    mockFetch(`<html><head><title>Some Video</title></head></html>`);
    const result = await extractUrlMetadata("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(result.thumbnail).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns undefined thumbnail for non-YouTube URLs when fetch fails", async () => {
    mockFetchFail();
    const result = await extractUrlMetadata("https://example.com/article");
    expect(result.thumbnail).toBeUndefined();
  });

  it("stores relative og:image URLs as-is (known limitation)", async () => {
    mockFetch(`<html><head>
      <meta property="og:image" content="/images/thumb.jpg" />
    </head></html>`);
    const result = await extractUrlMetadata("https://example.com/article");
    // Relative URLs are stored without the origin — they will render broken
    expect(result.thumbnail).toBe("/images/thumb.jpg");
  });
});

describe("getYouTubeThumbnailUrl", () => {
  it("returns thumbnail for youtube.com/watch?v= URLs", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(getYouTubeThumbnailUrl(url)).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });

  it("returns thumbnail for youtu.be short URLs", () => {
    const url = "https://youtu.be/dQw4w9WgXcQ";
    expect(getYouTubeThumbnailUrl(url)).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });

  it("returns undefined for non-YouTube URLs", () => {
    expect(getYouTubeThumbnailUrl("https://example.com/video")).toBeUndefined();
    expect(getYouTubeThumbnailUrl("https://vimeo.com/123456")).toBeUndefined();
  });

  it("returns undefined for a youtube.com URL without a video ID", () => {
    expect(getYouTubeThumbnailUrl("https://www.youtube.com/channel/UCxxx")).toBeUndefined();
  });

  it("does not match lookalike domains", () => {
    expect(getYouTubeThumbnailUrl("https://notyoutube.com/watch?v=abc")).toBeUndefined();
    expect(getYouTubeThumbnailUrl("https://youtube.com.evil.com/watch?v=abc")).toBeUndefined();
  });

  it("returns undefined for an invalid URL", () => {
    expect(getYouTubeThumbnailUrl("not-a-url")).toBeUndefined();
  });
});

describe("detectSource", () => {
  it("detects arxiv.org as arxiv", () => {
    expect(detectSource("https://arxiv.org/abs/2301.00001")).toBe("arxiv");
  });

  it("detects doi.org as doi", () => {
    expect(detectSource("https://doi.org/10.1038/nature12373")).toBe("doi");
  });

  it("detects dx.doi.org as doi", () => {
    expect(detectSource("https://dx.doi.org/10.1038/nature12373")).toBe("doi");
  });

  it("detects github.com as github", () => {
    expect(detectSource("https://github.com/org/repo")).toBe("github");
  });

  it("returns web for unrecognised domains", () => {
    expect(detectSource("https://example.com/paper")).toBe("web");
  });

  it("returns manual for empty string", () => {
    expect(detectSource("")).toBe("manual");
  });
});
