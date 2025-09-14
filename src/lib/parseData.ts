import weapons from "../../data/weapon_rarity.json";
import characters from "../../data/character_rarity.json";
import { BKTree } from "./BKTree.ts";

const dictionary = new BKTree(
  Object.keys(weapons).concat(Object.keys(characters))
);

// all whitespace + a digit + all whitespace + dash + all whitespace + wildcard
const rarityRegex = /\W+\d\W*-\W*.*/;

function correctName(name: string, tree: BKTree): [string, number] {
  const [result, distance] = tree
    .search(name)
    .find(([, distance]) => distance <= 2) || [name, Infinity];

  if (distance === Infinity) console.error("Invalid name", result);

  return [result, distance];
}


function sanitizeItem(name: string): [string, number] {
  const cleaned = name?.trim().replace(rarityRegex, "").trim();
  if (!cleaned) return [cleaned, Infinity];

  return correctName(cleaned, dictionary);
}

function sanitizeItemNames(data: string[]) {
  const str = data.join("");
  const index = str.indexOf("Item Name");
  const [head, ...items] = str
    .substring(index)
    .split("\n")
    .filter((s) => s.trim() !== "");

//   console.log({ head, items });
  const res = [];

  for (let i = 0; i < items.length; ++i) {
    const [cleaned, distance] = sanitizeItem(items[i]);

    if (distance <= 2) {
      res.push(cleaned);
      continue;
    }
    

    // Our item name is partial
    // so we try joining it with the next item
    // Genshin only has item names upto 2 rows AFAIK
    const [joined, joinedDistance] = sanitizeItem(
      cleaned + " " + items[i + 1]?.trim()
    );

    if (joinedDistance <= 2) {
      res.push(joined);
      i += 1;
    }
  }

  console.log(res);
}

export { sanitizeItemNames };
