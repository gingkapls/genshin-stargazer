import type { RecognizeResult } from "tesseract.js";
import type { ScanRegions } from "./scan.types";
import type { Scheduler } from "./Scheduler.ts";

async function scanSingleRegion(region: ScanRegions, scheduler: Scheduler) {
  return await Promise.all(
    region.rectangles
      .map((rectangle) =>
        scheduler.scheduler.addJob(
          "recognize",
          region.image,
          { rectangle },
          { blocks: true, text: false }
        )
      )
      .concat(
        scheduler.pageWorker.recognize(
          region.image,
          { rectangle: region.pageRectangle },
          { blocks: true, text: false }
        )
      )
  );
}

// TODO: Better names...
export async function scanImages(
  regions: ScanRegions[],
  scheduler: Scheduler,
  callback: (region: ScanRegions) => void
): Promise<RecognizeResult[][]> {
  const results = await Promise.all(
    regions.map((region) =>
      scanSingleRegion(region, scheduler).then((data) => {
        callback(region);
        return data;
      })
    )
  );

  return results;
}
