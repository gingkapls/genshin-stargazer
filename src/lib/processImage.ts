import { getOpenCv, translateException } from "./opencv.ts";

export async function processImage(
  input: HTMLImageElement,
  output: HTMLCanvasElement
) {
  try {
    const cv = await getOpenCv();
    const src = cv.imread(input);
    const dst = new cv.Mat();
    const temp = new cv.Mat();

    // Resizing while maintaining aspect ratio for faster OCR
    if (input.width > 1920)
      cv.resize(
        src,
        src,
        new cv.Size(1920, 1920 * (input.height / input.width)),
        0,
        0,
        cv.INTER_AREA
      );

    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY, 0);

    // Converting to HSV
    cv.cvtColor(src, src, cv.COLOR_BGR2HSV, 0);
    const lowerB = new cv.Mat(
      src.rows,
      src.cols,
      src.type(),
      [100, 80, 205, 0]
    );
    const upperB = new cv.Mat(
      src.rows,
      src.cols,
      src.type(),
      [102, 90, 215, 255]
    );

    cv.cvtColor(src, temp, cv.COLOR_BGR2GRAY, 0);

    cv.inRange(src, lowerB, upperB, temp);

    // Thresholding
    cv.threshold(dst, dst, 170, 255, cv.THRESH_BINARY);
    cv.bitwise_not(dst, dst);

    // Hough Line Transform
    // To crop the wish table
    const lines = new cv.Mat();
    const edges = new cv.Mat();
    cv.Canny(temp, edges, 50, 200, 3);
    cv.HoughLinesP(edges, lines, 1, Math.PI / 90, 5, 250, 4);

    let minX = Infinity;
    let maxX = 0;
    let minY = Infinity;
    let maxY = 0;
    let rows = 0;

    for (let i = 0; i < lines.rows; ++i) {
      const x1 = lines.data32S[i * 4];
      const y1 = lines.data32S[i * 4 + 1];

      const x2 = lines.data32S[i * 4 + 2];
      const y2 = lines.data32S[i * 4 + 3];

      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);

      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);

      
    }

    const height = maxY - minY;
    const width = maxX - minX;

    cv.imshow(output, temp);

    // release resources
    src.delete();
    dst.delete();
    upperB.delete();
    lowerB.delete();
    temp.delete();

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
