import { FuzzedDataProvider } from "@jazzer.js/core";
import { getYouTubeThumbnailUrl, detectSource } from "../src/lib/metadata";

/**
 * Fuzz test for URL-handling functions in metadata.ts.
 *
 * - getYouTubeThumbnailUrl: wraps new URL() in a try/catch, should never throw.
 * - detectSource: calls new URL() and may throw TypeError on invalid input;
 *   the fuzz harness explicitly ignores that expected error class.
 */
export function fuzz(data: Buffer): void {
  const provider = new FuzzedDataProvider(data);
  const input = provider.consumeString(512);

  // getYouTubeThumbnailUrl already handles malformed URLs internally.
  getYouTubeThumbnailUrl(input);

  // detectSource throws TypeError for malformed URLs — that is expected
  // behaviour, not a bug. Only propagate truly unexpected error types.
  try {
    detectSource(input);
  } catch (e) {
    if (!(e instanceof TypeError)) {
      throw e;
    }
  }
}
