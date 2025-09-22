import { type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { hashCode } from "../lib/hash.ts";
import type { Images } from "../types/State.type.ts";

interface FolderPickerProps {
  images: Images;
  setImages: Dispatch<SetStateAction<Images>>;
}

function ImagePicker({ images, setImages }: FolderPickerProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const res: Images = {};

    Array.from(e.target.files, (f) => {
      const src = URL.createObjectURL(f);
      const hash = "h" + hashCode(f.name + f.size + f.lastModified);
      res[hash] = src;
    });

    const uniqueImages = { ...images, ...res };
    setImages(uniqueImages);
  }

  return (
    <>
      <label className="btn-add">
        Add images
        <input type="file" multiple accept="image/*" onChange={handleChange} />
      </label>
    </>
  );
}

export { ImagePicker };
