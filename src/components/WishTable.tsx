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
  return bannerList[nextIndex - 1];
}

function getRarity(itemName: string) {
  return wepMap.get(itemName) || charMap.get(itemName);
}

function getItemType(itemName: string) {
  if (wepMap.get(itemName)) return "Weapon";

  return "Character";
}

function getClassName(itemName: string) {
  const rarity = getRarity(itemName)?.toLowerCase();

  if (rarity === "5 stars") return "five-stars";
  if (rarity === "4 stars") return "four-stars";

  return "three-star";
}

function getPity(rarity: string, fiveStarPity: number, fourStarPity: number) {
  if (rarity === '5 Star') return fiveStarPity;
  if (rarity === '4 Star') return fourStarPity;
  
  return 1;
}

function WishTable({ wishes }: { wishes: Wish[] }) {
  if (wishes.length === 0) return null;
  let groupCount = 1;
  let fourStarPity = 1;
  let fiveStarPity = 1;

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
        {wishes.map((wish, i) => {
          const rarity = getRarity(wish.itemName);
          fourStarPity = rarity?.toLowerCase() === '4 star' ? 0 : fourStarPity + 1;

          fiveStarPity = rarity?.toLowerCase() === '5 star' ? 0 : fiveStarPity + 1;

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
              <td>{getPity(rarity, fiveStarPity, fourStarPity)}</td>
              <td>{i + 1}</td>
              <td>
                {wishes[Math.max(i - 1, 0)].timeReceived !== wish.timeReceived
                  ? ++groupCount
                  : groupCount}
              </td>
              <td>{getBanner(wish.timeReceived)[1]}</td>
              <td>{wish.wishType}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export { WishTable };
