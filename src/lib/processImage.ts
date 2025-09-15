import { getOpenCv, translateException } from "./opencv.ts";

export async function processImage(
  input: HTMLImageElement,
  output: HTMLCanvasElement
) {
  try {
    const cv = await getOpenCv();
    const src = cv.imread(input);
    const dst = new cv.Mat();

    // Resizing for clearer OCR
    // cv.resize(src, src, new cv.Size(1920, 1080), 0, 0, cv.INTER_AREA);

    // Grayscaling
    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY);

    // Blurring
    const ksize = new cv.Size(2, 2);
    const anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    cv.blur(dst, dst, ksize, anchor, cv.BORDER_DEFAULT);
    // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)

    // Thresholding
    cv.threshold(dst, dst, 180, 255, cv.THRESH_BINARY);
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
    src.delete();
    dst.delete();

    return {
      top: minY,
      left: minX,
      height,
      width,
    };
  } catch (err) {
    console.error(translateException(cv, err));
  }
}
