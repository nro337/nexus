import { getYouTubeThumbnailUrl } from "../src/lib/metadata";

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
