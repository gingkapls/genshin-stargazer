import type {
  WishHistoryList,
  WishHistoryTable,
} from "../components/wishHistory";
import type { parsedHistoryPage, Wish } from "./parseData.ts";

// We store the pages from newest to oldest as they are in game
function pageComparator(
  p1: parsedHistoryPage,
  p2: parsedHistoryPage
): -1 | 0 | 1 {
  // if there are no wishes
  // then there's a bigger problem than their order
  if (p1.wishType !== p2.wishType)
    throw new Error("Trying to compare different wish types");

  // Last (oldest) wish of p1 vs First (newest) wish of p2
  // P1 is newer than p2 so p1 should come first
  // (Higher timestamp is newer)
  if (p1.wishes.at(-1)!.timeReceived > p2.wishes.at(0)!.timeReceived) return -1;

  // p2 is newer than p1 so p2 should come first
  if (p1.wishes.at(-1)!.timeReceived < p2.wishes.at(0)!.timeReceived) return 1;

  // If both are same or either is undefined, then we rely on the page numbers
  // lower = newer
  if (p1.pageNumber > p2.pageNumber) return -1;

  if (p1.pageNumber < p2.pageNumber) return 1;

  // If in the rare case page numbers are undefined
  // we return zero since the order is undeterminable
  return 0;
}

function convertToKey(
  wishType: parsedHistoryPage["wishType"]
): keyof WishHistoryTable {
  return wishType
    .toLowerCase()
    .split(" ")
    .join("_")
    .replaceAll("-", "_") as keyof WishHistoryTable;
}

// TODO : Refactor to work with wishes instead
function historyReducer(
  acc: WishHistoryTable,
  cur: parsedHistoryPage
): WishHistoryTable {
  const wishType = convertToKey(cur.wishType);

  // TODO: Implement wish merging algorithm
  // to not add duplicates
  acc[wishType] = acc[wishType].concat(cur);

  return acc;
}

// Mutating cause I can't be bothered and it's fine here
// FIXME: This doesn't account for sparse histories
function sortWishHistory(history: WishHistoryTable): WishHistoryTable {
  for (const type of Object.keys(history)) {
    history[type as keyof typeof history].sort(pageComparator);
  }

  return history;
}

function historyTableToList(history: WishHistoryTable): WishHistoryList {
  const res = {} as WishHistoryList;

  for (const type of Object.keys(history)) {
    res[type as keyof WishHistoryList] = history[type as keyof typeof history]
      .sort(pageComparator)
      .map((page) => page.wishes)
      .flat();
  }

  return res;
}

// This is only to be used with same type of wishes
// and in sorted lists
function isSameWish(w1: Wish, w2: Wish) {
  return w1.itemName === w2.itemName && w1.timeReceived === w2.timeReceived;
}

// Adapted from the merge algorithm in merge sort
function mergeList(oldList: Wish[], newList: Wish[]): Wish[] {
  // The list is sorted from newest to oldest
  const mergedList = [];

  let i = 0;
  let j = 0;

  while (i < newList.length && j < oldList.length) {
    // New list has newer wish
    if (newList[i].timeReceived > oldList[j].timeReceived) {
      mergedList.push(newList[i]);
      ++i;
      continue;
    }

    // Old list has newer wish
    if (newList[i].timeReceived < oldList[j].timeReceived) {
      mergedList.push(oldList[j]);
      ++j;
      continue;
    }

    // Same time and same wish
    if (isSameWish(newList[i], oldList[j])) {
      mergedList.push(newList[i]);
      ++i;
      ++j;
      continue;
    }

    // Same time but different wishes
    mergedList.push(newList[i]);
    mergedList.push(oldList[j]);
    ++i;
    ++j;
  }

  // If the earlier loop exists early
  // Taking care of leftovers
  // Only one of the following loops will ever excute
  // So we don't check for timestamps since they're individually sorted
  for (; i < newList.length; ++i) {
    mergedList.push(newList[i]);
  }

  for (; j < oldList.length; ++j) {
    mergedList.push(oldList[j]);
  }

  return mergedList;
}

function mergeHistories(
  oldHistory: WishHistoryList,
  newHistory: WishHistoryList
): WishHistoryList {
  const res = {} as WishHistoryList;

  for (const type of Object.keys(oldHistory)) {
    res[type as keyof typeof res] = mergeList(
      oldHistory[type as keyof typeof oldHistory],
      newHistory[type as keyof typeof newHistory]
    );
    // console.log(oldHistory[type], newHistory[type], res[type], type);
  }

  return res;
}

export { sortWishHistory, historyReducer, mergeHistories, historyTableToList };
