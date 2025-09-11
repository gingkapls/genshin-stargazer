import { getOpenCv } from "./opencv.ts";

export async function processImage(
  input: HTMLImageElement,
  output: HTMLCanvasElement
) {
  const cv = await getOpenCv();
  const src = cv.imread(input);
  const dst = new cv.Mat();

  // Grayscaling
  cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY);

  // Thresholding
  // cv.threshold(dst, dst, 165, 255, cv.THRESH_BINARY);
  cv.bitwise_not(dst, dst);

  cv.imshow(output, dst);

  // Filtering
  // cv.blur(dst, dst, { width: 10, height: 10 });

  // release resources
  src.delete();
  dst.delete();
}
