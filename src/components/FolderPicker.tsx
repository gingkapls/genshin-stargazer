import { useReducer, useState, type ChangeEvent } from "react";
import Scanner from "./Scanner.tsx";
import type { parsedHistoryPage } from "../lib/parseData.ts";
import type { WishHistory } from "./wishHistory.ts";
import type { WishImage } from "./wishImage";

function reducer(state: WishHistory, action: { page: parsedHistoryPage }) {
  const wishType = action.page.wishType
    .toLowerCase()
    .split(" ")
    .join("_") as keyof WishHistory;

  const newHistory = state[wishType].some(
    (page) => page.hash === action.page.hash
  )
    ? state[wishType]
    : state[wishType].concat(action.page);

  return {
    ...state,
    [wishType]: newHistory,
  };
}

function FolderPicker() {
  const [images, setImages] = useState<WishImage[]>([]);
  const [processedHashes, setProcessedHashes] = useState<Set<string>>(
    new Set()
  );

  const [data, dispatch] = useReducer<
    WishHistory,
    [Parameters<typeof reducer>[1]]
  >(reducer, {
    character_event_wish: [],
    weapon_event_wish: [],
    permanent_wish: [],
    chronicled_wish: [],
  });
  console.log({ data });
  console.log({ hashes: [...processedHashes.entries()] });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImages(
        Array.from(e.target.files, (f) => {
          const i = URL.createObjectURL(f);
          const hash = f.name + f.size + f.lastModified;
          return { src: i, hash };
        })
      );
    }
  }

  return (
    <>
      <input type="file" multiple onChange={handleChange} />
      <Scanner
        images={images}
        processedHashes={processedHashes}
        setProcessedHashes={setProcessedHashes}
        data={data}
        dispatch={dispatch}
      />
    </>
  );
}

export default FolderPicker;
