import { getOpenCv, translateException } from "./opencv.ts";

export async function processImage(
  input: HTMLImageElement,
  output: HTMLCanvasElement
) {
  try {
    const cv = await getOpenCv();
    const src = cv.imread(input);
    const dst = new cv.Mat();

    const color = new cv.Scalar(0, 0, 0); // red

    // cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
    // cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);

    // Grayscaling
    // cv.resize(src, src, new cv.Size(1920, 1080), 0, 0, cv.INTER_AREA);

    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY);

    // const M = cv.Mat.ones(1, 1, cv.CV_8U);
    // const anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    // cv.erode(dst, dst, cv.Mat.ones(1, 1, cv.CV_8U), anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    // Thresholding
    cv.threshold(dst, dst, 181, 255, cv.THRESH_BINARY);
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

    // let border = cv.Mat.zeros(dst.rows, dst.cols, cv.CV_8UC3);

    // Horizontals
    // cv.line(dst, new cv.Point(minX, minY), new cv.Point(maxX, minY), color, 10);
    // cv.line(dst, new cv.Point(minX, maxY), new cv.Point(maxX, maxY), color, 10);

    // Verticals
    // cv.line(dst, new cv.Point(minX, minY), new cv.Point(minX, maxY), color, 10);
    // cv.line(dst, new cv.Point(maxX, minY), new cv.Point(maxX, maxY), color, 10);
    //
    const height = maxY - minY;
    const width = maxX - minX;

    // cv.rectangle(dst, new cv.Point(0, 0), new cv.Point(120, 120), [0, 0, 255, 255]);
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
