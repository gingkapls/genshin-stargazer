import { useState, type ActionDispatch, type ChangeEvent } from "react";
import Scanner from "./Scanner.tsx";
import type { WishImage } from "./wishImage";
import type { WishHistoryList } from "./wishHistory";

interface FolderPickerProps {
  dispatch: ActionDispatch<[{ newHistory: WishHistoryList }]>;
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
    <h3>Uploaded {images.length} images</h3>
      <Scanner images={images} dispatch={dispatch} />
    </>
  );
}

export default FolderPicker;
