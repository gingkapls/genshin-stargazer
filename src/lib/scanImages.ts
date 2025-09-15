import Tesseract, {
  createScheduler,
  createWorker,
  PSM,
  type RecognizeResult,
} from "tesseract.js";
import { parseData } from "./parseData.ts";

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

export class Scheduler {
  static #instance: Scheduler;
  scheduler: Tesseract.Scheduler = createScheduler();
  pageWorker!: Tesseract.Worker;

  constructor() {
    if (Scheduler.#instance !== undefined) {
      return Scheduler.#instance;
    }

    Scheduler.#instance = this;
  }

  async initialize(callback?: Function) {
    const workers = await Promise.all(
      Array(10)
        .fill(0)
        .map(() => createWorker("eng"))
    );

    for await (const worker of workers) {
      worker.setParameters(COLUM_PARAMS);
    }

    const pageWorker = await createWorker("eng");
    await pageWorker.setParameters(PAGE_PARAMS);

    if (typeof callback === "function") callback();

    workers.forEach((worker) => {
      this.scheduler.addWorker(worker);
    });

    this.pageWorker = pageWorker;

    return this;
  }

  async terminate() {
    this.scheduler.terminate();
    this.pageWorker.terminate();
  }
}

export interface ScanRegions {
  image: HTMLImageElement | HTMLCanvasElement;
  rectangles: Tesseract.Rectangle[];
  pageRectangle: Tesseract.Rectangle;
}

export function getRegions(
  image: HTMLCanvasElement | HTMLImageElement,
  offset: {
    top: number;
    left: number;
    height: number;
    width: number;
  }
): ScanRegions {
  const pageRectangle = getRectangle(PAGE_COUNT_BBOX, offset);

  const rectangles = [
    ITEM_TYPE_BBOX,
    ITEM_NAME_BBOX,
    WISH_TYPE_BBOX,
    TIME_RECEIVED_BBOX,
  ].map((bbox) => getRectangle(bbox, offset));

  return { image, rectangles, pageRectangle } satisfies ScanRegions;
}

export function processResult(results: RecognizeResult[]) {
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
  

  
  return parseData(blocks);
}

export async function scanImages(
  regions: ScanRegions[],
  scheduler: Tesseract.Scheduler,
  pageWorker: Tesseract.Worker,
  callback: (data: Tesseract.RecognizeResult) => void
): Promise<RecognizeResult[][]> {
  const results = await Promise.all(
    regions.map(
      async (region) =>
        await Promise.all(
          region.rectangles
            .map((rectangle) =>
              scheduler
                .addJob(
                  "recognize",
                  region.image,
                  { rectangle },
                  { blocks: true, text: false }
                )
                .then((data) => (callback(data), data))
            )
            .concat(
              pageWorker.recognize(
                region.image,
                { rectangle: region.pageRectangle },
                { blocks: true, text: false }
              )
            )
        )
    )
  );

  return results;
}

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
  // return [results.map((r) => r.data);
}
  */
