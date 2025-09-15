import { useRef, type ActionDispatch } from "react";
import { processImage } from "../lib/processImage.ts";
import { scanImage } from "../lib/scanImages.ts";
import { parseData, type parsedHistoryPage } from "../lib/parseData.ts";
import type { WishHistory } from "./wishHistory.ts";

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
  src: string;
  data: WishHistory;
  dispatch: ActionDispatch<[{ page: parsedHistoryPage }]>;
}

function Scanner({ src, data, dispatch }: ScannerProps) {
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLImageElement | null>(null);

  function handleLoad() {
    async function doStuff() {
      if (outputRef.current === null || inputRef.current === null) return;

      const offset = await processImage(inputRef.current, outputRef.current);

      if (!offset) return;

      const { rectangles, blocks } = await scanImage(outputRef.current, offset);
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
    }

    doStuff();
  }

  if (data) {
    // console.log(data);
    // const res = parseData(data);
    // console.log(res);
  }

  return (
    <>
      <h1>Small Wish test</h1>
      <img ref={inputRef} src={src} alt="sample" onLoad={handleLoad}></img>
      <canvas ref={outputRef} />
    </>
  );
}

export default Scanner;
