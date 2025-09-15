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

// TODO: Implement hashing
export interface ScanResult {
  itemType: string[];
  itemName: string[];
  wishType: string[];
  timeReceived: string[];
  pageNumber: string[];
}

const TOP_RATIO = 0.199;
const HEIGHT_RATIO = 0.655;

// TODO: Remove ITEM_TYPE_BBOX since it's computable from ITEM_NAME
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
  LEFT_RATIO: 0.682,
  WIDTH_RATIO: 0.26,
  HEIGHT_RATIO,
};

const PAGE_COUNT_BBOX: bbox = {
  TOP_RATIO: 0.87,
  LEFT_RATIO: 0.47,
  WIDTH_RATIO: 0.08,
  HEIGHT_RATIO: 0.08,
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

export class Scheduler {
  static COLUM_PARAMS = {
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890():-' \n",
    preserve_interword_spaces: "1",
  };

  static PAGE_PARAMS = {
    tessedit_pageseg_mode: PSM.RAW_LINE,
    tessedit_char_whitelist: "0123456789 \n",
    preserve_interword_spaces: "1",
  };

  static #instance: Scheduler;
  scheduler: Tesseract.Scheduler = createScheduler();
  pageWorker!: Tesseract.Worker;

  constructor() {
    if (Scheduler.#instance !== undefined) {
      return Scheduler.#instance;
    }

    Scheduler.#instance = this;
  }

  async initialize(callback?: () => void) {
    const workers = await Promise.all(
      Array(10)
        .fill(0)
        .map(() => createWorker("eng"))
    );

    for await (const worker of workers) {
      worker.setParameters(Scheduler.COLUM_PARAMS);
    }

    const pageWorker = await createWorker("eng");
    await pageWorker.setParameters(Scheduler.PAGE_PARAMS);

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
  image: HTMLCanvasElement;
  rectangles: Tesseract.Rectangle[];
  pageRectangle: Tesseract.Rectangle;
}

export function getRegions(
  image: HTMLCanvasElement,
  offset: {
    top: number;
    left: number;
    height: number;
    width: number;
  }
): ScanRegions {
  const pageRectangle = getRectangle(PAGE_COUNT_BBOX, offset);

  // TODO: Remove ITEM_TYPE_BBOX since it's computable from ITEM_NAME
  const rectangles = [
    ITEM_TYPE_BBOX,
    ITEM_NAME_BBOX,
    WISH_TYPE_BBOX,
    TIME_RECEIVED_BBOX,
  ].map((bbox) => getRectangle(bbox, offset));

  return { image, rectangles, pageRectangle } satisfies ScanRegions;
}

// TODO: Generate page hash
// TODO: Remove ITEM_TYPE since it's computable from ITEM_NAME
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
  // TODO: Clean this mess
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

  console.log("processImage", { results });

  return results;
}
