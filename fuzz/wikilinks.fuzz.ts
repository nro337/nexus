import fc from "fast-check";
import { extractWikilinks } from "../src/lib/wikilinks";

/**
 * Property-based fuzz tests for extractWikilinks().
 * The regex-based parser should never throw regardless of input.
 */
describe("extractWikilinks", () => {
  it("never throws for any string input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(() => extractWikilinks(input)).not.toThrow();
      }),
    );
  });

  it("always returns an array", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(Array.isArray(extractWikilinks(input))).toBe(true);
      }),
    );
  });
});
