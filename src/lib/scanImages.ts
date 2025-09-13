import Tesseract, { createScheduler, createWorker, PSM } from "tesseract.js";

// Bounding Box
interface bbox {
  TOP_RATIO: number;
  LEFT_RATIO: number;
  WIDTH_RATIO: number;
  HEIGHT_RATIO: number;
}

const TOP_RATIO = 0.255;
const HEIGHT_RATIO = 0.54;

const ITEM_TYPE_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.195,
  WIDTH_RATIO: 0.08,
  HEIGHT_RATIO,
};

const ITEM_NAME_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.288,
  WIDTH_RATIO: 0.151,
  HEIGHT_RATIO,
};

const WISH_TYPE_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.444,
  WIDTH_RATIO: 0.14,
  HEIGHT_RATIO,
};

const TIME_RECEIVED_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.595,
  WIDTH_RATIO: 0.18,
  HEIGHT_RATIO,
};

const PAGE_COUNT_BBOX: bbox = {
  TOP_RATIO: 0.788,
  LEFT_RATIO: 0,
  WIDTH_RATIO: 1,
  HEIGHT_RATIO: 0.07,
};

function getRectangle(
  bbox: bbox,
  image: { width: number; height: number }
): Tesseract.Rectangle {
  return {
    top: bbox.TOP_RATIO * image.height,
    left: bbox.LEFT_RATIO * image.width,
    width: bbox.WIDTH_RATIO * image.width,
    height: bbox.HEIGHT_RATIO * image.height,
  };
}

export async function scanImage(image: HTMLCanvasElement | HTMLImageElement) {
  const scheduler = createScheduler();
  const worker1 = await createWorker("eng");
  const worker2 = await createWorker("eng");
  const pageWorker = await createWorker("eng");

  const COLUM_PARAMS = {
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    preserve_interword_spaces: "1",
  };

  const PAGE_PARAMS = {
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
    preserve_interword_spaces: "1",
  };

  worker1.setParameters(COLUM_PARAMS);
  worker2.setParameters(COLUM_PARAMS);
  pageWorker.setParameters(PAGE_PARAMS);

  const pageRectangle = getRectangle(PAGE_COUNT_BBOX, image);

  const page = await pageWorker.recognize(
    image,
    { rectangle: pageRectangle },
    { text: true, blocks: true, hocr: true}
  );

  const rectangles = [
    ITEM_TYPE_BBOX,
    ITEM_NAME_BBOX,
    WISH_TYPE_BBOX,
    TIME_RECEIVED_BBOX,
  ].map((bbox) => getRectangle(bbox, image));

  scheduler.addWorker(worker1);
  scheduler.addWorker(worker2);

  const results = await Promise.all(
    rectangles.map((rectangle) =>
      scheduler.addJob(
        "recognize",
        image,
        { rectangle },
        { blocks: true, text: false }
      )
    )
  );

  results.push(page);
  console.log(page);

  const [itemType, itemName, wishType, timeReceived, pageCount] = results.map(
    (r) => r.data.blocks?.map((block) => block.text)
  );

  console.log({ itemType, itemName, wishType, timeReceived, pageCount });
  await scheduler.terminate();
  return rectangles.concat(pageRectangle);
  // return [results.map((r) => r.data);
}
