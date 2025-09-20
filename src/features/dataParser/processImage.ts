import type { Rectangle } from "tesseract.js";
import { getOpenCv, translateException } from "../scanner/lib/opencv/opencv.ts";
import type { bbox, ScanRegions } from "../scanner/utils/scan.types.ts";
import {
  ITEM_NAME_BBOX,
  PAGE_COUNT_BBOX,
  TIME_RECEIVED_BBOX,
  WISH_TYPE_BBOX,
} from "../scanner/utils/config.ts";

async function preprocessImage(
  input: HTMLImageElement,
  output: HTMLCanvasElement
) {
  try {
    const cv = await getOpenCv();
    const src = cv.imread(input);
    const dst = new cv.Mat();

    // Resizing while maintaining aspect ratio for faster OCR
    if (input.width > 1920)
      cv.resize(
        src,
        src,
        new cv.Size(1920, (1920 * input.height) / input.width),
        0,
        0,
        cv.INTER_AREA
      );

    // Grayscaling
    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY);

    // Thresholding
    cv.threshold(dst, dst, 170, 255, cv.THRESH_BINARY);
    cv.bitwise_not(dst, dst);

    // Hough Line Transform
    // To crop the wish table
    const lines = new cv.Mat();
    const edges = new cv.Mat();
    cv.Canny(dst, edges, 50, 200, 3);
    cv.HoughLinesP(edges, lines, 1, Math.PI / 90, 5, 250, 4);

    let minX = Infinity;
    let maxX = 0;
    let minY = Infinity;
    let maxY = 0;

    for (let i = 0; i < lines.rows; ++i) {
      minX = Math.min(minX, lines.data32S[i * 4]);
      minY = Math.min(minY, lines.data32S[i * 4 + 1]);

      maxX = Math.max(maxX, lines.data32S[i * 4 + 2]);
      maxY = Math.max(maxY, lines.data32S[i * 4 + 3]);
    }

    const height = maxY - minY;
    const width = maxX - minX;

    cv.imshow(output, dst);

    // release resources
    edges.delete();
    lines.delete();
    src.delete();
    dst.delete();

    return {
      top: minY,
      left: minX,
      height,
      width,
    };
  } catch (err: unknown) {
    console.error(translateException(cv, err));
  }
}

function getRectangle(
  bbox: bbox,
  offset: { top: number; left: number; height: number; width: number }
): Tesseract.Rectangle {
  return {
    top: offset.top + bbox.TOP_RATIO * offset.height,
    left: offset.left + bbox.LEFT_RATIO * offset.width,
    width: bbox.WIDTH_RATIO * offset.width,
    height: bbox.HEIGHT_RATIO * offset.height,
  };
}

function calcRegions(image: HTMLCanvasElement, offset: Rectangle): ScanRegions {
  const pageRectangle = getRectangle(PAGE_COUNT_BBOX, offset);

  const rectangles = [ITEM_NAME_BBOX, WISH_TYPE_BBOX, TIME_RECEIVED_BBOX].map(
    (bbox) => getRectangle(bbox, offset)
  );

  return { image, rectangles, pageRectangle } satisfies ScanRegions;
}

async function getScanRegion(
  inputEl: HTMLImageElement,
  outputEl: HTMLCanvasElement
) {
  const offset = await preprocessImage(inputEl, outputEl);

  if (!offset) throw new Error("No offset found. Couldn't process image");

  const rectangle = calcRegions(outputEl, offset);

  return rectangle;
}

export { getScanRegion };
