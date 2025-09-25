import { JSDOM } from "jsdom";

function getCharName(row: HTMLTableRowElement) {
  return (row.children[1] as HTMLElement).dataset.name;
}

function getCharRarity(row: HTMLTableRowElement) {
  return ((row.children[2].firstChild as HTMLElement).firstChild as HTMLElement)?.title;
}

function getPlayableCharsList(dom: JSDOM) {
  const [playable, upcoming] = dom.window.document.querySelectorAll(
    "table.sortable tbody"
  );
  const playableArr = Array.from(playable.querySelectorAll("tr"));
  const upcomingArr = Array.from(upcoming.querySelectorAll("tr"));

  return playableArr.concat(upcomingArr);
}

function getChars(dom: JSDOM) {
  const rows = getPlayableCharsList(dom);
  const data = rows.reduce<{ [name: string]: string }>((acc, cur) => {
    const name = getCharName(cur);
    const rarity = getCharRarity(cur);

    // There are some undefined rows for some reason
    if (name === undefined || rarity === undefined) return acc;

    acc[name] = rarity;
    return acc;
  }, {});

  return data;
}

async function fetchCharacters() {
  const page = await fetch(
    "https://genshin-impact.fandom.com/wiki/Character/List"
  ).then((res) => res.arrayBuffer());

  const dom = new JSDOM(page);

  const list = getChars(dom);
  console.log(`Fetched ${Object.keys(list).length} characters`);

  return list;
}

export { fetchCharacters };
