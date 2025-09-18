import { Fragment, useState, type ActionDispatch } from "react";
import { processImage } from "../lib/processImage.ts";
import {
  getRegions,
  processResult,
  scanImages,
  Scheduler,
  type ScanRegions,
} from "../lib/scanImages.ts";
import type { WishHistoryList } from "./wishHistory.ts";
import type { WishImage } from "./wishImage";
import Tesseract from "tesseract.js";
import { historyReducer, sortWishHistory } from "../lib/historyReducer.ts";

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
  dispatch: ActionDispatch<[{ newHistory: WishHistoryList }]>;
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
function Scanner({ images, dispatch }: ScannerProps) {
  const [rects, setRects] = useState<ScanRegions[]>([]);
  const [scannedImages, setScannedImages] = useState<Set<string>>(new Set());
  const [processedHashes, setProcessedHashes] = useState<Set<string>>(
    new Set()
  );
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  if (images.length !== 0 && rects.length === images.length) {
    // We've loaded and pre-processed dall images
    for (const rect of rects) {
      drawBoxes(rect.image, rect.rectangles.concat(rect.pageRectangle));
    }
    console.debug("Loaded all images");
  }

  function handleLoad(hash: string) {
    async function doStuff() {
      if (processedHashes.has(hash)) {
        console.debug("Already processed");
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
  // Function to handle scanning
  async function handleClick() {
    if (isScanning) {
      console.log("Already scanning");
      return;
    }

    console.debug("clicked", { rects });
    // Only scan new images
    const newRects = rects.filter(({ image }) => !scannedImages.has(image.id));

    // No new images
    if (newRects.length === 0) {
      console.debug("Already scanned");
      return;
    }

    setIsScanning(() => true);
    console.debug("Start time", new Date());
    const scheduler = new Scheduler();
    await scheduler.initialize();
    let i = 0;
    const res = await scanImages(
      newRects,
      scheduler.scheduler,
      scheduler.pageWorker,
      (region: ScanRegions) => {
        console.debug("Scanning image", region.image.id);
        setScannedImages((oldImages) =>
          new Set(oldImages).add(region.image.id)
        );
        // TODO: Add a progress component
        // console.log("progress: ", (++i / rects.length) * 100);
        setProgress((p) => (p += 1));
      }
    );

    await scheduler.terminate();

    const newHistory = res
      .map(processResult)
      .reduce<WishHistoryList>(historyReducer, {
        character_event_wish: [],
        character_event_wish_2: [],
        weapon_event_wish: [],
        permanent_wish: [],
        chronicled_wish: [],
      });

    sortWishHistory(newHistory);

    console.log({ newHistory });
    // TODO: Move all processing here
    dispatch({ newHistory });
    setIsScanning(() => false);
  }

  // TODO: Hide images
  // TODO: Convert them into thumbnails
  return (
    <>
      {images.length !== 0 && processedHashes.size === images.length && (
        <button type="button" onClick={handleClick}>
          Scan
        </button>
      )}
      {isScanning && (
        <p>{`Scanned ${progress} out of ${images.length} images`}</p>
      )}
      <section className="images">
        {images.map((image, i) => (
          <Fragment key={image.hash}>
            <img
              className="src_image"
              id={image.hash}
              src={image.src}
              alt="sample"
              style={{
                top: (i + 1) * 100 + "px",
              }}
              onLoad={() => handleLoad(image.hash)}
            ></img>
            <canvas
              id={"canvas" + "_" + image.hash}
              className="out_image"
              style={{
                top: (i + 1) * 200 + "px",
              }}
            />
          </Fragment>
        ))}
      </section>
    </>
  );
}

export default Scanner;
