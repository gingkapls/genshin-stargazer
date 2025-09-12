import { useState, useRef, useEffect } from "react";
import { processImage } from "../lib/processImage.ts";
import { scanImage } from "../lib/scanImages.ts";

function Scanner({ imageSrc }: { imageSrc: string }) {
  const [data, setData] = useState<Tesseract.Block[]>([]);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function doStuff() {
      if (outputRef.current === null || inputRef.current === null) return;

      await processImage(inputRef.current, outputRef.current);

      console.log(imageSrc);
      scanImage(outputRef.current);
    }

    doStuff();
  }, []);

  return (
    <>
      <h1>Small Wish test</h1>
      <img
        ref={inputRef}
        src={imageSrc}
        alt="Sample"
        style={{ display: "none" }}
      ></img>
      <canvas ref={outputRef} style={{ visibility: 'hidden' }}/>
      <pre>{data.map((block) => block.text).join("")}</pre>
    </>
  );
}

export default Scanner;
