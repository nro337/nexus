import fc from "fast-check";
import { getYouTubeThumbnailUrl, detectSource } from "../src/lib/metadata";

/**
 * Property-based fuzz tests for URL-handling functions in metadata.ts.
 *
 * - getYouTubeThumbnailUrl: wraps new URL() in a try/catch, should never throw.
 * - detectSource: calls new URL() and may throw TypeError on invalid input;
 *   the test explicitly ignores that expected error class.
 */
describe("getYouTubeThumbnailUrl", () => {
  it("never throws for any string input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(() => getYouTubeThumbnailUrl(input)).not.toThrow();
      }),
    );
  });
});

describe("detectSource", () => {
  it("either returns a value or throws only TypeError for invalid URLs", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        try {
          detectSource(input);
        } catch (e) {
          // TypeError for malformed URLs is expected behaviour, not a bug.
          expect(e).toBeInstanceOf(TypeError);
        }
      }),
    );
  });
});
