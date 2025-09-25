import type { RecognizeResult } from "tesseract.js";
import type { ScanRegions } from "./scan.types";
import type { Scheduler } from "./Scheduler.ts";
import { ImageError } from "../../../utils/ImageError.ts";

async function scanSingleRegion(region: ScanRegions, scheduler: Scheduler) {
  try {
    return Promise.all(region.rectangles
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
      ));
  } catch (error) {
    const srcImage = document.querySelector<HTMLImageElement>(
      "#" + region.image.id.substring(7)
    );
    if (!srcImage) throw new Error("No image found to scan", { cause: error });

    throw new ImageError("There was an error scanning the image", srcImage);
  }
}

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
