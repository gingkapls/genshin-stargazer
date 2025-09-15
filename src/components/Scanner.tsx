import {
  Fragment,
  useRef,
  type ActionDispatch,
  type Dispatch,
  type SetStateAction,
} from "react";
import { processImage } from "../lib/processImage.ts";
import { scanImage, sched } from "../lib/scanImages.ts";
import { parseData, type parsedHistoryPage } from "../lib/parseData.ts";
import type { WishHistory } from "./wishHistory.ts";
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
  data,
  processedHashes,
  setProcessedHashes,
  dispatch,
}: ScannerProps) {
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLImageElement | null>(null);

  function handleLoad(hash: string) {
    async function doStuff(hash: string) {
      // Don't process already processed images
      if (processedHashes.has(hash)) return;

      if (outputRef.current === null || inputRef.current === null) return;

      const offset = await processImage(inputRef.current, outputRef.current);

      if (!offset) return;

      const { rectangles, blocks } = await scanImage(
        sched,
        outputRef.current,
        offset
      );
      const ctx = outputRef.current.getContext("2d");
      if (!ctx) return;

      rectangles.forEach(({ top, left, height, width }) => {
        const newCol = genRandomColor();
        ctx.strokeStyle = newCol;
        ctx.rect(left, top, width, height);
        ctx.stroke();
      });

      const res = parseData(blocks);
      dispatch({ page: res });
      setProcessedHashes(new Set(processedHashes).add(hash));
    }

    doStuff(hash);
  }

  if (data) {
    // console.log(data);
    // const res = parseData(data);
    // console.log(res);
  }

  return (
    <>
      <h1>Small Wish test</h1>
      {images.map(({ src, hash }) => (
        <Fragment key={hash}>
          <img
            ref={inputRef}
            src={src}
            alt="sample"
            onLoad={() => handleLoad(hash)}
          ></img>
          <canvas ref={outputRef} />
        </Fragment>
      ))}
    </>
  );
}

export default Scanner;
