import fc from "fast-check";
import { slugify, stringToColor } from "../src/lib/utils";

/**
 * Property-based fuzz tests for slugify() and stringToColor().
 * Both are pure string-transform functions; neither should ever throw.
 */
describe("slugify", () => {
  it("never throws for any string input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(() => slugify(input)).not.toThrow();
      }),
    );
  });

  it("returns a string for any input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(typeof slugify(input)).toBe("string");
      }),
    );
  });
});

describe("stringToColor", () => {
  it("never throws for any string input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(() => stringToColor(input)).not.toThrow();
      }),
    );
  });

  it("returns a string for any input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(typeof stringToColor(input)).toBe("string");
      }),
    );
  });
});
