import type { Wish } from "../lib/parseData.ts";
import characters from "../../data/character_rarity.json";
import banners from "../../data/banner_characters.json";
import weapons from "../../data/weapon_rarity.json";

const wepMap = new Map(Object.entries(weapons));
const charMap = new Map(Object.entries(characters));
const bannerMap = new Map(Object.entries(banners));

function WishTable({ wishes }: { wishes: Wish[] }) {
  if (wishes.length === 0) return null;
  // TODO: Fix group calculation based on previous time
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
          <tr>
            <td>{wepMap.get(wish.itemName) ? "Weapon" : charMap.get(wish.itemName) && "Character"}</td>
            <td>{wish.itemName}</td>
            <td>{wish.timeReceived}</td>
            <td>{wepMap.get(wish.itemName) || charMap.get(wish.itemName)}</td>
            <td>{i + 1}</td>
            <td>{Math.ceil((i + 1) / 10)}</td>
            <td>Banner</td>
            <td>{wish.wishType}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { WishTable };
