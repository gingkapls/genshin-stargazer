import type { Wish } from "../lib/parseData.ts";
import characters from "../../data/character_rarity.json";
import banners from "../../data/banners.json";
import weapons from "../../data/weapon_rarity.json";

const wepMap = new Map(Object.entries(weapons));
const charMap = new Map(Object.entries(characters));
const bannerList = Object.entries(banners)
  .map(([date, name]) => [new Date(date).valueOf(), name])
  .sort(([d1], [d2]) => Number(d1) - Number(d2));

function findBanner(d: number) {
  //FIXME:  Account for Character Event Wish-2 and 1
  const nextIndex = Math.max(
    bannerList.findIndex((banner) => Number(banner[0]) > d),
    1
  );
  return bannerList[nextIndex - 1];
}

function WishTable({ wishes }: { wishes: Wish[] }) {
  if (wishes.length === 0) return null;
  let groupCount = 1;
  // TODO: Fix group calculation based on previous time
  // TODO: Implement banner fetching
  return (
    <table>
      <caption>{wishes[0].wishType}</caption>
      <thead>
        <tr>
          <th>Item Type</th>
          <th>Item Name</th>
          <th>Time Received</th>
          <th>Stars</th>
          <th>Roll</th>
          <th>Group</th>
          <th>Banner</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {wishes.map((wish, i) => (
          <tr key={wish.id}>
            <td>
              {wepMap.get(wish.itemName)
                ? "Weapon"
                : charMap.get(wish.itemName) && "Character"}
            </td>
            <td>{wish.itemName}</td>
            <td>{new Date(wish.timeReceived).getFullYear()}</td>
            <td>{wepMap.get(wish.itemName) || charMap.get(wish.itemName)}</td>
            <td>{i + 1}</td>
            <td>{wishes[Math.max(i - 1, 0)].timeReceived !== wish.timeReceived ? ++groupCount : groupCount}</td>
            <td>{findBanner(wish.timeReceived)[1]}</td>
            <td>{wish.wishType}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { WishTable };
