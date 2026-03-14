import { extractWikilinks } from "../src/lib/wikilinks";

describe("extractWikilinks", () => {
  it("returns empty array for text without wikilinks", () => {
    expect(extractWikilinks("No links here")).toEqual([]);
  });

  it("returns empty array for an empty string", () => {
    expect(extractWikilinks("")).toEqual([]);
  });

  it("extracts a single wikilink", () => {
    expect(extractWikilinks("See [[My Resource]]")).toEqual(["My Resource"]);
  });

  it("extracts multiple wikilinks", () => {
    expect(extractWikilinks("[[Alpha]] and [[Beta]]")).toEqual(["Alpha", "Beta"]);
  });

  it("trims whitespace from titles", () => {
    expect(extractWikilinks("[[ My Resource ]]")).toEqual(["My Resource"]);
  });

  it("ignores empty brackets (no content)", () => {
    // [[\]\] has no inner content matching [^\]]+ so it is not captured
    expect(extractWikilinks("[[]] is not a valid wikilink")).toEqual([]);
  });

  it("handles wikilinks mixed with regular text", () => {
    expect(
      extractWikilinks("Start [[Resource A]] middle [[Resource B]] end")
    ).toEqual(["Resource A", "Resource B"]);
  });

  it("preserves duplicate wikilinks", () => {
    expect(extractWikilinks("[[A]] and [[A]] again")).toEqual(["A", "A"]);
  });

  it("handles wikilinks spanning punctuation and spaces", () => {
    expect(extractWikilinks("Check [[My Cool Resource!]]")).toEqual([
      "My Cool Resource!",
    ]);
  });
});
