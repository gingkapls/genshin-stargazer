import weapons from "../../data/weapon_rarity.json";
import characters from "../../data/character_rarity.json";
import { BKTree } from "./BKTree.ts";
import type { ScanResult } from "./scanImages.ts";

export interface Wish {
  id: ReturnType<typeof crypto.randomUUID>;
  itemName: string;
  wishType: string;
  part: "" | "Part 2";
  timeReceived: number;
  pageNumber: number;
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

/* const rarityMap = new Map(
  Object.entries(characters).concat(Object.entries(weapons))
); */

// all whitespace + a digit + all whitespace + dash + all whitespace + wildcard
const rarityRegex = /\W+\d\W*-\W*.*/;

function correctName(name: string, tree: BKTree): [string, number] {
  const [result, distance] = tree
    // More tolerant towards longer strings
    .search(name, Math.ceil(name.length / 5))
    .sort(([, d1], [, d2]) => d1 - d2)[0] || [name, Infinity];

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

  if (!cleaned) return [cleaned, Infinity];

  return correctName(cleaned, dict);
}

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
function pad(n: number, maxLength = 2, fillString = "0"): string {
  return n.toString().padStart(maxLength, fillString);
}

function parseDate(timestamp: number) {
  const dateObj = new Date(timestamp);
  const date = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
    dateObj.getDate()
  )}`;

  const time = `${pad(dateObj.getHours())}:${pad(
    dateObj.getMilliseconds()
  )}:${pad(dateObj.getSeconds())}`;
  
  return `${date} ${time}`;
}

function parseData(data: ScanResult): Wish[] {
  const pageNumber = Number(data.pageNumber[0]?.trim());

  const itemNamesCol = prepareColumn(data.itemName, "Item Name")[1];
  const itemNames = sanitizeItems(itemNamesCol, itemNamesDict);

  const wishTypesCol = prepareColumn(data.wishType, "Wish Type")[1];
  const wishTypes = sanitizeItems(wishTypesCol, wishTypesDict);

  const timeReceived = prepareColumn(data.timeReceived, "Time Received")[1].map(
    (time) =>
      new Date(time.substring(0, 10) + " " + time.substring(10)).valueOf()
  );

  const wishes = itemNames.map<Wish>((itemName, i) => {
    return {
      id: crypto.randomUUID(),
      itemName,
      pageNumber,
      wishType: wishTypes[i].replace("-2", ""),
      part: wishTypes[i].includes("-2") ? "Part 2" : "",
      timeReceived: timeReceived[i],
    };
  });

  return wishes;
}

export { parseData, parseDate };
