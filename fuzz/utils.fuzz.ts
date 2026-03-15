import { FuzzedDataProvider } from "@jazzer.js/core";
import { slugify, stringToColor } from "../src/lib/utils";

/**
 * Fuzz test for slugify() and stringToColor().
 * Both are pure string-transform functions; neither should ever throw.
 */
export function fuzz(data: Buffer): void {
  const provider = new FuzzedDataProvider(data);
  const input = provider.consumeString(512);

  slugify(input);
  stringToColor(input);
}
