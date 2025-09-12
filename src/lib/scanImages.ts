import Tesseract, { createScheduler, createWorker, PSM } from "tesseract.js";

// Bounding Box
interface bbox {
  TOP_RATIO: number;
  LEFT_RATIO: number;
  WIDTH_RATIO: number;
  HEIGHT_RATIO: number;
}

const TOP_RATIO = 0.29;
const HEIGHT_RATIO = 0.49;

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
  LEFT_RATIO: 0.58,
  WIDTH_RATIO: 0.20,
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
  const scheduler = createScheduler();
  const worker1 = await createWorker("eng");
  const worker2 = await createWorker("eng");

  worker1.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    preserve_interword_spaces: "1",
  });

  worker2.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    preserve_interword_spaces: "1",
  });

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

  const [itemType, itemName, wishType, timeReceived] = results.map((r) =>
    r.data.blocks?.map((block) => block.text)
  );

  console.log({ itemType, itemName, wishType, timeReceived });
  await scheduler.terminate();
  return results.map((r) => r.data);
}
