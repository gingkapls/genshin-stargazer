import weapons from "../../data/weapon_rarity.json";
import characters from "../../data/character_rarity.json";
import { BKTree } from "./BKTree.ts";
import type { ScanResult } from "./scanImages.ts";

export interface Wish {
  itemName: string;
  itemType: string;
  rarity: string;
  timeReceived: number;
}

const itemNamesDict = new BKTree(
  Object.keys(weapons).concat(Object.keys(characters))
);

const wishTypesDict = new BKTree([
  "Character Event Wish",
  "Character Event Wish-2",
  "Permanent Wish",
  "Chronicled Wish",
  "Weapon Event Wish",
]);

const rarityMap = new Map(
  Object.entries(characters).concat(Object.entries(weapons))
);

// all whitespace + a digit + all whitespace + dash + all whitespace + wildcard
const rarityRegex = /\W+\d\W*-\W*.*/;

function correctName(name: string, tree: BKTree): [string, number] {
  const [result, distance] = tree
  // More tolerant towards longer strings
    .search(name, Math.ceil(name.length / 5))
    .sort(([, d1], [, d2]) => d1 - d2)[0] || [name, Infinity];
    
  console.log({result, distance})

  return [result, distance];
}

function prepareColumn(data: string[], header: string): [string, string[]] {
  const str = data.join("");
  const index = str.indexOf(header);
  const [head, ...items] = str
    .substring(index)
    .split("\n")
    .filter((s) => s.trim() !== "");
  return [head, items];
}

function sanitizeSingleItem(name: string, dict: BKTree): [string, number] {
  const cleaned = name?.trim().replace(rarityRegex, "").trim();
  console.log({cleaned})

  if (!cleaned) return [cleaned, Infinity];

  return correctName(cleaned, dict);
}

// FIXME: Doesn't work with raiden shogun
function sanitizeItems(items: string[], dict: BKTree) {
  const res = [];

  for (let i = 0; i < items.length; ++i) {
    const [cleaned, distance] = sanitizeSingleItem(items[i], dict);

    if (distance <= Math.ceil(cleaned.length / 5)) {
      res.push(cleaned);
      continue;
    }

    // Our item name is partial
    // so we try joining it with the next item
    // Genshin only has item names upto 2 rows AFAIK
    const [joined, joinedDistance] = sanitizeSingleItem(
      cleaned + " " + items[i + 1]?.trim(),
      dict
    );

    if (joinedDistance <= 2) {
      res.push(joined);
      i += 1;
    }
  }
  return res;
}

// TODO: Implement Date Parser
// function parseDates(dateStr: string) {
// We know our date is always going to be in the format
// yyyy-mm-dd[\W]hh:mm:ss
//   dateStr.replace(/\W/);
// }

export interface parsedHistoryPage {
  wishes: Wish[];
  pageNumber: string;
  wishType: string;
}

// TODO: Remove rarity and itemType since they're computable from itemName
function parseData(data: ScanResult): parsedHistoryPage {
  const pageNumber = data.pageNumber[0]?.trim();

  const itemNamesCol = prepareColumn(data.itemName, "Item Name")[1];
  const itemNames = sanitizeItems(itemNamesCol, itemNamesDict);

  const itemTypesCol = prepareColumn(data.itemType, "Item Type")[1];

  const wishTypesCol = prepareColumn(data.wishType, "Wish Type")[1];
  const wishType = sanitizeItems(wishTypesCol, wishTypesDict)[0];

  const timeReceived = prepareColumn(data.timeReceived, "Time Received")[1].map(
    (time) =>
      new Date(time.substring(0, 10) + " " + time.substring(10)).valueOf()
  );
  
  // TODO: Remove rarity and item type since they're computable
  const wishes = itemNames.map<Wish>((itemName, i) => {
    return {
      itemName,
      itemType: itemTypesCol[i],
      rarity: rarityMap.get(itemName) || "3-star",
      timeReceived: timeReceived[i],
    };
  });

  // Create a hash for our page to avoid duplicates
  return { wishes, pageNumber, wishType };
}

export { parseData };
