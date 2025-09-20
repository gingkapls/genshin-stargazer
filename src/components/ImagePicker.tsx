import { type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import type { WishImage } from "../types/Wish.types.ts";
import { hashCode } from "../lib/hash.ts";

interface FolderPickerProps {
  images: WishImage[];
  setImages: Dispatch<SetStateAction<WishImage[]>>;
}

function ImagePicker({ images, setImages }: FolderPickerProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newImages = Array.from(e.target.files, (f) => {
        const i = URL.createObjectURL(f);
        const hash = "h" + hashCode(f.name + f.size + f.lastModified);
        return { src: i, hash } satisfies WishImage;
      });

      setImages(newImages);
    }
  }

  return (
    <>
      <input type="file" multiple accept="image/*" onChange={handleChange} />
      <h3>Images to scan: {images.length}</h3>
    </>
  );
}

export { ImagePicker };
