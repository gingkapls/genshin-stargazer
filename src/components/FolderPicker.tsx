import { useState, type ChangeEvent } from "react";
import Scanner from "./Scanner.tsx";

function FolderPicker() {
  const [images, setImages] = useState<string[]>(["null"]);

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
      {images.map((src) => src !== "null" && <Scanner key={src} src={src} />)}
    </>
  );
}

export default FolderPicker;
