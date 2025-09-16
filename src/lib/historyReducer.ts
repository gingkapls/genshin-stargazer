import type { WishHistory } from "../components/wishHistory";
import type { parsedHistoryPage } from "./parseData.ts";

function convertToKey(
  wishType: parsedHistoryPage["wishType"]
): keyof WishHistory {
  return wishType
    .toLowerCase()
    .split(" ")
    .join("_")
    .replaceAll("-", "_") as keyof WishHistory;
}

// TODO : Refactor to work with wishes instead
export function historyReducer(
  acc: WishHistory,
  cur: parsedHistoryPage
): WishHistory {
  const wishType = convertToKey(cur.wishType);

  // TODO: Implement wish merging algorithm
  // to not add duplicates
  acc[wishType] = acc[wishType].concat(cur.wishes);
  return acc;
}
