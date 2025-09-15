import { useReducer, useState, type ChangeEvent } from "react";
import Scanner from "./Scanner.tsx";
import type { parsedHistoryPage } from "../lib/parseData.ts";
import type { WishHistory } from "./wishHistory.ts";
import type { WishImage } from "./wishImage";


// TODO: move somewhere better
function convertToKey(
  wishType: parsedHistoryPage["wishType"]
): keyof WishHistory {
  return wishType
    .toLowerCase()
    .split(" ")
    .join("_")
    .replaceAll("-", "_") as keyof WishHistory;
}

function reducer(state: WishHistory, action: { pages: parsedHistoryPage[] }) {
  // TODO: Implement hashing
  // TODO: make it more readable maybe?
  return action.pages.reduce<WishHistory>(
    (acc, cur) => {
      const wishType = convertToKey(cur.wishType);

      // TODO: Change pageNumber to hash
      const hasPage: boolean =
        acc[wishType].findIndex(
          ({ pageNumber }) => cur.pageNumber === pageNumber
        ) === -1;

      return {
        ...acc,
        ...(hasPage && { [wishType]: acc[wishType].concat(cur) }),
      };
    },
    {
      ...state,
    }
  );
}

function FolderPicker() {
  const [images, setImages] = useState<WishImage[]>([]);

  const [data, dispatch] = useReducer<
    WishHistory,
    [Parameters<typeof reducer>[1]]
  >(reducer, {
    character_event_wish: [],
    character_event_wish_2: [],
    weapon_event_wish: [],
    permanent_wish: [],
    chronicled_wish: [],
  });

  console.log(data);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newImages = Array.from(e.target.files, (f) => {
        const i = URL.createObjectURL(f);
        const hash =
          "h" + f.name.replaceAll(/[.-]/g, "_") + f.size + f.lastModified;
        return { src: i, hash } satisfies WishImage;
      });

      // Deduplicate images
      const uniqueImages = images.concat(
        newImages.filter(
          (image) => images.findIndex((i) => i.hash === image.hash) === -1
        )
      );
      setImages(uniqueImages);
    }
  }

  return (
    <>
      <input type="file" multiple onChange={handleChange} />
      <Scanner images={images} data={data} dispatch={dispatch} />
    </>
  );
}

export default FolderPicker;
