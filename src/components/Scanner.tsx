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
import type { WishImage } from "./wishImage";
import Tesseract from "tesseract.js";

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
  dispatch: ActionDispatch<[{ pages: parsedHistoryPage[] }]>;
}

function drawBoxes(
  canvasEl: HTMLCanvasElement,
  rectangles: Tesseract.Rectangle[]
) {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  rectangles.forEach(({ top, left, height, width }) => {
    const newCol = genRandomColor();
    ctx.strokeStyle = newCol;
    ctx.rect(left, top, width, height);
    ctx.stroke();
  });
}

// TODO: Refactor Scanner
// TODO: Set global data state
function Scanner({ images, data, dispatch }: ScannerProps) {
  const [rects, setRects] = useState<ScanRegions[]>([]);
  // TODO: Lift hashed state upward
  const [scannedImages, setScannedImages] = useState<Set<string>>(new Set());
  const [processedHashes, setProcessedHashes] = useState<Set<string>>(
    new Set()
  );
  const [finalData, setFinalData] = useState<Tesseract.RecognizeResult[][]>([]);
  const pCount = rects.length;

  useEffect(() => {
    if (images.length !== 0 && pCount === images.length) {
      // We've loaded all images
      for (const rect of rects) {
        drawBoxes(rect.image, rect.rectangles.concat(rect.pageRectangle));
      }
      console.log("Loaded all images");
    }
  }, [pCount, images.length, rects]);

  useEffect(() => {
    if (finalData.length !== images.length) return;
    // We've scanned all images

    dispatch({ pages: finalData.map(processResult) });
  }, [finalData, images, dispatch]);

  // TODO: Lift ProcessedHashes state up
  // TODO: remove unused i param
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
    }

    doStuff();
  }

  // TODO: Refactor this into its own function
  async function handleClick() {
    console.log("clicked", { rects });
    // Only scan new images
    const newRects = rects.filter(({ image }) => !scannedImages.has(image.id));

    // No new images
    if (newRects.length === 0) {
      console.log("Already scanned");
      console.log({ finalData });
      return;
    }

    console.log("Start time", new Date());
    const scheduler = new Scheduler();
    await scheduler.initialize();
    let i = 0;
    const res = await scanImages(
      newRects,
      scheduler.scheduler,
      scheduler.pageWorker,
      (region: ScanRegions) => {
        console.log("Scanning image", region.image.id);
        setScannedImages((oldImages) =>
          new Set(oldImages).add(region.image.id)
        );
        console.log("progress: ", (++i / rects.length) * 100);
      }
    );
    
    await scheduler.terminate();

    setFinalData((d) => d.concat(res));
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
