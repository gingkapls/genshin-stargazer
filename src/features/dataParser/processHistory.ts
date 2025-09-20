import type { RecognizeResult } from "tesseract.js";
import type { ScanResult } from "../scanner/utils/scan.types.ts";
import { createEmptyWishHistory } from "../../lib/createEmptyWishHistory.ts";
import { historyReducer, sortWishHistory } from "./historyReducer.ts";
import type { Wish, WishHistory } from "../../types/Wish.types.ts";
import { parseScanResults } from "./parseData.ts";

/**
 * @param results Array of data containing text blocks from different columns
 * @returns A list of Wish objects sorted in order from newest to oldest time received
 **/
function processScanResult(results: RecognizeResult[]): Wish[] {
  const [itemName, wishType, timeReceived, pageNumber] = results.map((r) =>
    r.data.blocks!.map((block) => block.text)
  );

  const blocks = {
    itemName,
    wishType,
    timeReceived,
    pageNumber,
  } satisfies ScanResult;

  return parseScanResults(blocks);
}

function processHistory(history: RecognizeResult[][]) {
  return sortWishHistory(
    history
      .map(processScanResult)
      .reduce<WishHistory>(historyReducer, createEmptyWishHistory())
  );
}

export { processHistory };
