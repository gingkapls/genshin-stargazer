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

  console.log(wishType);

  return {
    ...state,
    [wishType]: state[wishType].concat([action.page]),
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
      const newImages = Array.from(e.target.files, (f) => {
        const i = URL.createObjectURL(f);
        const hash =
          "h" + f.name.replaceAll(/[.-]/g, "_") + f.size + f.lastModified;
        return { src: i, hash } satisfies WishImage;
      });
      
      const uniqueImages = images.concat(newImages.filter(image => images.findIndex(i => i.hash === image.hash) === -1));
      setImages(uniqueImages);
    }
  }

  return (
    <>
      <input type="file" multiple onChange={handleChange} />
      <Scanner
        images={images}
        data={data}
        processedHashes={processedHashes}
        setProcessedHashes={setProcessedHashes}
        dispatch={dispatch}
      />
    </>
  );
}

export default FolderPicker;
