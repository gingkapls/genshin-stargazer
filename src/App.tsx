import { useEffect, useRef, useState } from "react";
import wishTest from "./assets/wish-test.jpg";
import "./App.css";
import { scanImage } from "./lib/scanImages.ts";
import { processImage } from "./lib/convertImage.ts";

function App() {
  const [data, setData] = useState("");
  const grayImageRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (grayImageRef.current === null) return;
    if (imageRef.current === null) return;
    console.log(grayImageRef.current);

    scanImage(imageRef.current.src).then(data => {
      setData(data);
    });
  }, [data]);

  useEffect(() => {
    async function doStuff() {
      if (grayImageRef.current === null || imageRef.current === null) return;

      await processImage(imageRef.current, grayImageRef.current);
    }

    doStuff();
  }, []);

  return (
    <>
      <h1>Wish test</h1>
      <img ref={imageRef} src={wishTest} alt="Sample"></img>
      <canvas ref={grayImageRef} />
      <pre>data: {data}</pre>
    </>
  );
}

export default App;
