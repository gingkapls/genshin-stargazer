import {
  useReducer,
  useState,
  type ActionDispatch,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import Scanner from "./Scanner.tsx";
import type { parsedHistoryPage } from "../lib/parseData.ts";
import type { WishImage } from "./wishImage";

interface FolderPickerProps {
  dispatch: ActionDispatch<[{ pages: parsedHistoryPage[] }]>;
}

function FolderPicker({ dispatch }: FolderPickerProps) {
  const [images, setImages] = useState<WishImage[]>([]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newImages = Array.from(e.target.files, (f) => {
        const i = URL.createObjectURL(f);
        const hash =
          "h" + f.name.replaceAll(/[.-]/g, "_") + f.size + f.lastModified;
        return { src: i, hash } satisfies WishImage;
      });

      // Adding the previous images
      // and deduplicate them before sending them to the scanner
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
      <Scanner images={images} dispatch={dispatch} />
    </>
  );
}

export default FolderPicker;
