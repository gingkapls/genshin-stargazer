import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ActionDispatch,
  type Dispatch,
  type SetStateAction,
} from "react";
import { processImage } from "../lib/processImage.ts";
import {
  getRegions,
  processResult,
  scanImage,
  scanImages,
  Scheduler,
  type bbox,
  type ScanRegions,
  type ScanResult,
} from "../lib/scanImages.ts";
import { parseData, type parsedHistoryPage } from "../lib/parseData.ts";
import type { WishHistory } from "./wishHistory.ts";
import type { Rectangle } from "tesseract.js";
import type { WishImage } from "./wishImage";

const colors = [
  "#FF5733", // Bright Red-Orange
  "#FFBD33", // Bright Yellow-Orange
  "#DBFF33", // Bright Lime
  "#75FF33", // Neon Green
  "#33FF57", // Bright Green
  "#33FFBD", // Bright Aqua
  "#33DBFF", // Bright Sky Blue
  "#3375FF", // Bright Blue
  "#5733FF", // Bright Indigo
  "#BD33FF", // Bright Violet
  "#FF33DB", // Bright Pink-Magenta
  "#FF3375", // Bright Hot Pink
];

function genRandomColor() {
  const color = colors[Math.round(Math.random() * (colors.length - 1))];
  return color;
}

interface ScannerProps {
  images: WishImage[];
  data: WishHistory;
  processedHashes: Set<string>;
  setProcessedHashes: Dispatch<SetStateAction<Set<string>>>;
  dispatch: ActionDispatch<[{ page: parsedHistoryPage }]>;
}

function Scanner({
  images,
  processedHashes,
  setProcessedHashes,
  data,
  dispatch,
}: ScannerProps) {
  const [rects, setRects] = useState<ScanRegions[]>([]);
  const pCount = rects.length / 4;

  console.log({ rects });

  useEffect(() => {
    if (images.length !== 0 && pCount === images.length) {
      console.log({ c: pCount, l: images.length });
      console.log("Loaded all images");
    }
  }, [pCount, images.length]);

  function handleLoad(hash: string, i: number) {
    async function doStuff() {
      if (processedHashes.has(hash)) {
        console.log("Already processed");
        return;
      }

      const inputEl = document.querySelector<HTMLImageElement>("#" + hash);
      const canvasEl = document.querySelector<HTMLCanvasElement>(
        "#" + "canvas" + "_" + hash
      );

      if (inputEl === null || canvasEl === null)
        throw new Error("Can't find image");

      const offset = await processImage(inputEl, canvasEl);

      if (!offset) throw new Error("No offset found. Couldn't process image");

      const rectangle = getRegions(canvasEl, offset);

      setRects((rects) => rects.concat(rectangle));
      setProcessedHashes(new Set(processedHashes.add(hash)));

      /*       const ctx = outputRef.current.getContext("2d");
      if (!ctx) return;

      rectangles.forEach(({ top, left, height, width }) => {
        const newCol = genRandomColor();
        ctx.strokeStyle = newCol;
        ctx.rect(left, top, width, height);
        ctx.stroke();
      });

      const res = parseData(blocks);
      dispatch({ page: res }); */
    }

    doStuff();
  }

  if (data) {
    // console.log(data);
    // const res = parseData(data);
    // console.log(res);
  }

  async function handleClick() {
    console.log("clicked", { rects });
    console.log("Start time", new Date());
    const scheduler = new Scheduler();
    await scheduler.initialize();
    let i = 0;
    const res = await scanImages(
      rects,
      scheduler.scheduler,
      scheduler.pageWorker,
      () => console.log("progress: ", (i++ / (4 * rects.length)) * 100)
    );
    
    console.log("end time", new Date());
    console.log(res);
    const result = res.map(processResult);
    console.log({result});

    console.log(data);
    
  }

  return (
    <>
      <h1>Small Wish test</h1>
      {images.length !== 0 && processedHashes.size === images.length && (
        <button type="button" onClick={handleClick}>
          Scan
        </button>
      )}
      {images.map((image, i) => (
        <Fragment key={image.hash}>
          <img
            id={image.hash}
            src={image.src}
            alt="sample"
            onLoad={() => handleLoad(image.hash, i)}
          ></img>
          <canvas id={"canvas" + "_" + image.hash} />
        </Fragment>
      ))}
    </>
  );
}

export default Scanner;
