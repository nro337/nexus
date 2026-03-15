import { FuzzedDataProvider } from "@jazzer.js/core";
import { extractWikilinks } from "../src/lib/wikilinks";

/**
 * Fuzz test for extractWikilinks().
 * The regex-based parser should never throw regardless of input.
 */
export function fuzz(data: Buffer): void {
  const provider = new FuzzedDataProvider(data);
  const input = provider.consumeString(1024);

  extractWikilinks(input);
}
