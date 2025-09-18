import type { Wish } from "../lib/parseData.ts";
import characters from "../../data/character_rarity.json";
import banners from "../../data/banners.json";
import weapons from "../../data/weapon_rarity.json";

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
  return wepMap.get(itemName) || charMap.get(itemName);
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
  
  console.log({name: wishes[i].itemName, prevBanner, currentBanner})

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

function WishTable({ wishes }: { wishes: Wish[] }) {
  if (wishes.length === 0) return null;

  const pityCounter = {
    perBanner: 0,
    groupCount: 1,
    fourStar: 0,
    fiveStar: 0,
  } satisfies PityCounter;

  // TODO: Fix group calculation based on previous time
  // TODO: Implement banner fetching based on wish type
  // FIXME: Time received column
  return (
    <table>
      <caption>{wishes[0].wishType}</caption>
      <thead>
        <tr>
          <th>Item Type</th>
          <th>Item Name</th>
          <th>Time Received</th>
          <th>Stars</th>
          <th>Pity</th>
          <th>#Roll</th>
          <th>Group</th>
          <th>Banner</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {wishes.toReversed().map((wish, i, arr) => {
          const rarity = getRarity(wish.itemName);

          const banner = getBanner(wish.timeReceived);

          return (
            <tr key={wish.id} className={getClassName(wish.itemName)}>
              <td>{getItemType(wish.itemName)}</td>
              <td>{wish.itemName}</td>
              <td>
                {
                  // TODO: fix time received
                  new Date(wish.timeReceived).getFullYear()
                }
              </td>
              <td>{rarity}</td>
              <td>{getPity(rarity, pityCounter)}</td>
              <td>{getPerBanner(arr, i, pityCounter)}</td>
              <td>{getGroupCount(arr, i, pityCounter)}</td>
              <td>{banner}</td>
              <td>{wish.wishType}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export { WishTable };
