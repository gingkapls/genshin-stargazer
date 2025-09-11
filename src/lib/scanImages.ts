import Tesseract, { createWorker, PSM } from "tesseract.js";

// Bounding Box
interface bbox {
  TOP_RATIO: number;
  LEFT_RATIO: number;
  WIDTH_RATIO: number;
  HEIGHT_RATIO: number;
}

const TOP_RATIO = 0.29;
const HEIGHT_RATIO = 0.44;

const ITEM_TYPE_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.18,
  WIDTH_RATIO: 0.09,
  HEIGHT_RATIO,
};

const ITEM_NAME_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.28,
  WIDTH_RATIO: 0.16,
  HEIGHT_RATIO,
};

const WISH_TYPE_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.43,
  WIDTH_RATIO: 0.17,
  HEIGHT_RATIO,
};

const TIME_RECEIVED_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.59,
  WIDTH_RATIO: 0.19,
  HEIGHT_RATIO,
};

function getRectangle(
  bbox: bbox,
  image: { width: number; height: number }
): Tesseract.Rectangle {
  const top = TOP_RATIO * image.height;
  const height = HEIGHT_RATIO * image.height;

  return {
    top,
    left: bbox.LEFT_RATIO * image.width,
    width: bbox.WIDTH_RATIO * image.width,
    height,
  };
}

export async function scanImage(image: HTMLCanvasElement) {
  const worker = await createWorker("eng");
  worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    preserve_interword_spaces: "1",
  });
  const ret = await worker.recognize(
    image,
    { rectangle: getRectangle(WISH_TYPE_BBOX, image) },
    { blocks: true, text: false }
  );
  await worker.terminate();
  console.log(ret.data);
  return ret.data;
}
