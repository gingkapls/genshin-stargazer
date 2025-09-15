import { useReducer, useState, type ChangeEvent } from "react";
import Scanner from "./Scanner.tsx";
import type { parsedHistoryPage } from "../lib/parseData.ts";
import type { WishHistory } from "./wishHistory.ts";

function reducer(state: WishHistory, action: { page: parsedHistoryPage }) {
  const wishType = action.page.wishType
    .toLowerCase()
    .split(" ")
    .join("_") as keyof WishHistory;

  console.log(wishType);

  return {
    ...state,
    [wishType]: state[wishType].concat([action.page]),
  };
}

function FolderPicker() {
  const [images, setImages] = useState<string[]>(["null"]);
  const [data, dispatch] = useReducer<
    WishHistory,
    [Parameters<typeof reducer>[1]]
  >(reducer, {
    character_event_wish: [],
    weapon_event_wish: [],
    permanent_wish: [],
    chronicled_wish: [],
  });

  console.log(data);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImages(
        Array.from(e.target.files, (f) => {
          const i = URL.createObjectURL(f);
          return i;
        })
      );
    }
  }

  return (
    <>
      <input type="file" multiple onChange={handleChange} />
      {images.map(
        (src) =>
          src !== "null" && (
            <Scanner key={src} src={src} data={data} dispatch={dispatch} />
          )
      )}
    </>
  );
}

export default FolderPicker;
