import { useEffect, useRef, useState } from "react";
import wishTest from "./assets/full-wish.webp";
import "./App.css";
import { scanImage } from "./lib/scanImages.ts";
import { processImage } from "./lib/processImage.ts";
import Tesseract from "tesseract.js";

function App() {
  const [data, setData] = useState<Tesseract.Block[]>([]);
  const grayImageRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    async function doStuff() {
      if (grayImageRef.current === null || imageRef.current === null) return;

      await processImage(imageRef.current, grayImageRef.current);
      if (grayImageRef.current === null) return;
      if (imageRef.current === null) return;
      console.log(grayImageRef.current);

      scanImage(grayImageRef.current).then((data) => {
        if (data.blocks) setData(data.blocks);
      });
    }

    doStuff();
  }, []);

  return (
    <>
      <h1>Wish test</h1>
      <img ref={imageRef} src={wishTest} alt="Sample"></img>
      <canvas ref={grayImageRef} />
      <pre>{data.map(block => block.text).join('')}</pre>
    </>
  );
}

export default App;
