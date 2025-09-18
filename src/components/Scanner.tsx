import { Fragment, useState, type ActionDispatch } from "react";
import { processImage } from "../lib/processImage.ts";
import {
  getRegions,
  processResult,
  scanImages,
  Scheduler,
  type ScanRegions,
} from "../lib/scanImages.ts";
import type { WishHistoryList } from "./wishHistory.ts";
import type { WishImage } from "./wishImage";
import { historyReducer, sortWishHistory } from "../lib/historyReducer.ts";

interface ScannerProps {
  images: WishImage[];
  dispatch: ActionDispatch<[{ newHistory: WishHistoryList }]>;
}

// TODO: Refactor Scanner
function Scanner({ images, dispatch }: ScannerProps) {
  const [rects, setRects] = useState<ScanRegions[]>([]);
  const [scannedImages, setScannedImages] = useState<Set<string>>(new Set());
  const [processedHashes, setProcessedHashes] = useState<Set<string>>(
    new Set()
  );
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const allImagesLoaded = images.length !== 0 && rects.length === images.length;

  if (allImagesLoaded) {
    console.debug("Loaded all images");
  }

  function handleLoad(hash: string) {
    async function doStuff() {
      if (processedHashes.has(hash)) {
        console.debug("Already processed");
        return;
      }

      const inputEl = document.querySelector<HTMLImageElement>("#" + hash);
      const canvasEl = document.querySelector<HTMLCanvasElement>(
        "#" + "canvas" + "_" + hash
      );

      if (inputEl === null || canvasEl === null)
        throw new Error("Can't find image");

      const offset = await processImage(inputEl, canvasEl);

      if (!offset) throw new Error("No offset found. Couldn't process image");

      const rectangle = getRegions(canvasEl, offset);

      setRects((rects) => rects.concat(rectangle));
      setProcessedHashes(new Set(processedHashes.add(hash)));
    }

    doStuff();
  }

  // TODO: Refactor this into its own function
  // Function to handle scanning
  async function handleClick() {
    if (isScanning) {
      console.log("Already scanning");
      return;
    }

    console.debug("clicked", { rects });
    // Only scan new images
    const newRects = rects.filter(({ image }) => !scannedImages.has(image.id));

    // No new images
    if (newRects.length === 0) {
      console.debug("Already scanned");
      return;
    }

    setIsScanning(() => true);
    console.debug("Start time", new Date());
    const scheduler = new Scheduler();
    await scheduler.initialize();
    const res = await scanImages(
      newRects,
      scheduler.scheduler,
      scheduler.pageWorker,
      (region: ScanRegions) => {
        console.debug("Scanning image", region.image.id);
        // TODO: Add a progress component
        // console.log("progress: ", (++i / rects.length) * 100);
        setProgress((p) => (p += 1));
      }
    );

    await scheduler.terminate();

    const newHistory = res
      .map(processResult)
      .reduce<WishHistoryList>(historyReducer, {
        character_event_wish: [],
        character_event_wish_2: [],
        weapon_event_wish: [],
        permanent_wish: [],
        chronicled_wish: [],
      });

    sortWishHistory(newHistory);

    console.log({ newHistory });
    // TODO: Move all processing here
    dispatch({ newHistory });
    // Set scanned images only after data state is set
    // to avoid data anomalies
    setScannedImages(
      (oldImages) =>
        new Set([...oldImages, ...rects.map((rect) => rect.image.id)])
    );

    setIsScanning(() => false);
  }

  // TODO: Hide images
  // TODO: Convert them into thumbnails
  return (
    // Only render Scan button when all images have been processed
    <>
      {allImagesLoaded && (
        <button type="button" onClick={handleClick}>
          Scan
        </button>
      )}

      {isScanning && (
        <p>{`Scanned ${progress} out of ${images.length} images`}</p>
      )}

      <section className="images">
        {images.map((image, i) => (
          <Fragment key={image.hash}>
            <img
              className="src_image"
              id={image.hash}
              src={image.src}
              alt="sample"
              style={{
                top: (i + 1) * 100 + "px",
              }}
              onLoad={() => handleLoad(image.hash)}
            ></img>
            <canvas
              id={"canvas" + "_" + image.hash}
              className="out_image"
              style={{
                top: (i + 1) * 200 + "px",
              }}
            />
          </Fragment>
        ))}
      </section>
    </>
  );
}

export default Scanner;
