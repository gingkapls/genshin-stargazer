import { parseDate } from "../features/dataParser/parseData.ts";
import characters from "../../data/character_rarity.json";
import banners from "../../data/banners.json";
import weapons from "../../data/weapon_rarity.json";
import type { RefObject } from "react";
import type { Wish } from "../types/Wish.types.ts";

const wepMap = new Map(Object.entries(weapons));
const charMap = new Map(Object.entries(characters));
const bannerList = Object.entries(banners)
  .map(([date, name]) => [new Date(date).valueOf(), name])
  .sort(([d1], [d2]) => Number(d1) - Number(d2));

function getBanner(d: number) {
  //FIXME:  Account for Character Event Wish-2 and 1
  const nextIndex = Math.max(
    bannerList.findIndex((banner) => Number(banner[0]) > d),
    1
  );
  return bannerList[nextIndex - 1][1];
}

function getRarity(itemName: string) {
  const rarity = wepMap.get(itemName) || charMap.get(itemName);

  if (!rarity) throw new Error("Couldn't get rarity");

  return rarity;
}

function getItemType(itemName: string) {
  if (wepMap.get(itemName)) return "Weapon";

  return "Character";
}

function getClassName(itemName: string) {
  const rarity = getRarity(itemName);

  if (rarity === "5 Stars") return "five-stars";
  if (rarity === "4 Stars") return "four-stars";

  return "three-star";
}

function getPity(rarity: string, pityCounter: PityCounter) {
  const prevFiveStarPity = ++pityCounter.fiveStar;
  const prevFourStarPity = ++pityCounter.fourStar;

  if (rarity === "5 Stars") {
    pityCounter.fiveStar = 0;
    return prevFiveStarPity;
  }
  if (rarity === "4 Stars") {
    pityCounter.fourStar = 0;
    return prevFourStarPity;
  }

  return 1;
}

// Returns the number of rolls done so far in the same banner
function getPerBanner(wishes: Wish[], i: number, pityCounter: PityCounter) {
  const prevBanner = getBanner(wishes[Math.max(i - 1, 0)].timeReceived);
  const currentBanner = getBanner(wishes[i].timeReceived);

  if (prevBanner === currentBanner) {
    return ++pityCounter.perBanner;
  } else {
    return (pityCounter.perBanner = 1);
  }
}

function getGroupCount(wishes: Wish[], i: number, pityCounter: PityCounter) {
  const prevWishTime = wishes[Math.max(i - 1, 0)].timeReceived;
  const curWishTime = wishes[i].timeReceived;

  if (prevWishTime === curWishTime) {
    return pityCounter.groupCount;
  } else {
    return ++pityCounter.groupCount;
  }
}

interface PityCounter {
  perBanner: number;
  groupCount: number;
  fourStar: number;
  fiveStar: number;
}

function WishTable({
  wishes,
  isActive,
  ref,
}: {
  wishes: Wish[];
  isActive: boolean;
  ref: RefObject<HTMLTableElement>;
}) {
  const pityCounter = {
    perBanner: 0,
    groupCount: 1,
    fourStar: 0,
    fiveStar: 0,
  } satisfies PityCounter;

  // FIXME: Time received column
  return (
    <div className={isActive ? "active-tab" : "inactive-tab"}>
      <table ref={ref}>
        <caption>{wishes[0]?.wishType}</caption>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Time</th>
            <th>⭐</th>
            <th>Pity</th>
            <th>#Roll</th>
            <th>Group</th>
            <th>Banner</th>
            <th>Part</th>
          </tr>
        </thead>
        <tbody>
          {wishes.map((wish, i) => {
            const rarity = getRarity(wish.itemName);

            const banner = getBanner(wish.timeReceived);

            return (
              <tr key={wish.id} className={getClassName(wish.itemName)}>
                <td>{getItemType(wish.itemName)}</td>
                <td>{wish.itemName}</td>
                <td>{parseDate(wish.timeReceived)} </td>
                <td>{rarity[0]}</td>
                <td>{getPity(rarity, pityCounter)}</td>
                <td>{getPerBanner(wishes, i, pityCounter)}</td>
                <td>{getGroupCount(wishes, i, pityCounter)}</td>
                <td>{banner}</td>
                <td>{wish.part}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {wishes.length === 0 && "No wishes recorded"}
    </div>
  );
}

export { WishTable };
