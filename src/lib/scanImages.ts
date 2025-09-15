import Tesseract, { createScheduler, createWorker, PSM } from "tesseract.js";

// Bounding Box
export interface bbox {
  TOP_RATIO: number;
  LEFT_RATIO: number;
  WIDTH_RATIO: number;
  HEIGHT_RATIO: number;
}

export interface ScanResult {
  itemType: string[];
  itemName: string[];
  wishType: string[];
  timeReceived: string[];
  pageNumber: string[];
}

const TOP_RATIO = 0.199;
const HEIGHT_RATIO = 0.654;

const ITEM_TYPE_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.06,
  WIDTH_RATIO: 0.125,
  HEIGHT_RATIO,
};

const ITEM_NAME_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.19,
  WIDTH_RATIO: 0.25,
  HEIGHT_RATIO,
};

const WISH_TYPE_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.443,
  WIDTH_RATIO: 0.223,
  HEIGHT_RATIO,
};

const TIME_RECEIVED_BBOX: bbox = {
  TOP_RATIO,
  LEFT_RATIO: 0.68,
  WIDTH_RATIO: 0.25,
  HEIGHT_RATIO,
};

const PAGE_COUNT_BBOX: bbox = {
  TOP_RATIO: 0.87,
  LEFT_RATIO: 0.47,
  WIDTH_RATIO: 0.08,
  HEIGHT_RATIO: 0.07,
};

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

const COLUM_PARAMS = {
  tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
  tessedit_char_whitelist:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890:-' \n",
  preserve_interword_spaces: "1",
};

const PAGE_PARAMS = {
  tessedit_pageseg_mode: PSM.SINGLE_WORD,
  tessedit_char_whitelist: "0123456789 ",
  preserve_interword_spaces: "1",
};

class Scheduler {
  static #instance: Scheduler;
  scheduler: Tesseract.Scheduler | null = null;
  workers: Tesseract.Worker[] | null = null;
  pageWorker: Tesseract.Worker | null = null;

  constructor() {
    if (Scheduler.#instance) return Scheduler.#instance;

    Scheduler.#instance = this;
    this.scheduler = createScheduler();
  }

  async initialize(callback: Function) {
    this.workers = await Promise.all(Array(2).map(() => createWorker("en")));

    this.workers.forEach((worker) => worker.setParameters(COLUM_PARAMS));
    this.pageWorker = await createWorker("eng");
    this.pageWorker.setParameters(PAGE_PARAMS);

    callback();
    return this;
  }

  async terminate() {
    this.scheduler?.terminate();
    this.pageWorker?.terminate();
  }
}

export async function scanImage(
  image: HTMLCanvasElement | HTMLImageElement,
  offset: { top: number; left: number; height: number; width: number }
) {
  const pageRectangle = getRectangle(PAGE_COUNT_BBOX, offset);

  const rectangles = [
    ITEM_TYPE_BBOX,
    ITEM_NAME_BBOX,
    WISH_TYPE_BBOX,
    TIME_RECEIVED_BBOX,
  ].map((bbox) => getRectangle(bbox, offset));

  return { rectangles, pageRectangle };

  /*
  const results = await Promise.all(
    rectangles
      .map((rectangle) =>
        scheduler.addJob(
          "recognize",
          image,
          { rectangle },
          { blocks: true, text: false }
        )
      )
      .concat(
        pageWorker.recognize(
          image,
          { rectangle: pageRectangle },
          { text: true, blocks: true, hocr: true }
        )
      )
  );

  const [itemType, itemName, wishType, timeReceived, pageNumber] = results.map(
    (r) => r.data.blocks!.map((block) => block.text)
  );
  const blocks = {
    itemType,
    itemName,
    wishType,
    timeReceived,
    pageNumber,
  } satisfies ScanResult;

  await scheduler.terminate();
  return { rectangles: rectangles.concat(pageRectangle), blocks };
  */
  // return [results.map((r) => r.data);
}
