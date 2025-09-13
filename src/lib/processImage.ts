import { getOpenCv, translateException } from "./opencv.ts";

export async function processImage(
  input: HTMLImageElement,
  output: HTMLCanvasElement
) {
  const cv = await getOpenCv();
  const src = cv.imread(input);
  const dst = new cv.Mat();

  try {
    // cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
    // cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);

    // Grayscaling
    cv.resize(src, src, new cv.Size(1920, 1080), 0, 0, cv.INTER_AREA);

    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY);


    // const M = cv.Mat.ones(1, 1, cv.CV_8U);
    // const anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    // cv.erode(dst, dst, cv.Mat.ones(1, 1, cv.CV_8U), anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    // Thresholding
    cv.threshold(dst, dst, 181, 255, cv.THRESH_BINARY);
    cv.bitwise_not(dst, dst);

    // cv.rectangle(dst, new cv.Point(0, 0), new cv.Point(120, 120), [0, 0, 255, 255]); 
    cv.imshow(output, dst);

    // release resources
    src.delete();
    dst.delete();
  } catch (err) {
    console.error(translateException(cv, err));
  }
}
