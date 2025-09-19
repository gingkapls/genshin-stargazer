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
import { useLocalStorage } from "../hooks/useLocalStorage.tsx";

interface ScannerProps {
  images: WishImage[];
  saveHistory: (newHistory: WishHistoryList) => void;
}

// TODO: Refactor Scanner
function Scanner({ images, saveHistory }: ScannerProps) {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const [rects, setRects] = useState<ScanRegions[]>([]);

  const [scannedImages, setScannedImages] = useLocalStorage<{
    [hash: string]: boolean;
  }>("scannedImages", {});

  const [processedHashes, setProcessedHashes] = useState<{
    [hash: string]: boolean;
  }>({});

  const allImagesLoaded = images.length !== 0 && rects.length === images.length;
  const allImagesScanned = images.length !== 0 && rects.length === 0;

  if (allImagesLoaded) {
    console.debug("Loaded all images");
  }

  function handleLoad(hash: string) {
    async function doStuff() {
      if (processedHashes[hash]) {
        console.debug("Already processed");
        return;
      }

      const inputEl = document.querySelector<HTMLImageElement>("#" + hash);
      const canvasEl = document.querySelector<HTMLCanvasElement>(
        "#" + "canvas" + "_" + hash
      );

      if (inputEl === null || canvasEl === null)
        throw new Error("Can't find image to process");

      const offset = await processImage(inputEl, canvasEl);

      if (!offset) throw new Error("No offset found. Couldn't process image");

      const rectangle = getRegions(canvasEl, offset);

      setRects((rects) => rects.concat(rectangle));
      setProcessedHashes((pHashes) => ({
        ...pHashes,
        [hash]: true,
      }));
    }

    doStuff();
  }

  // TODO: Refactor this into its own function
  // Function to handle scanning
  async function handleClick() {
    if (isScanning) {
      console.debug("Already scanning");
      return;
    }
    console.debug("clicked", { rects });

    // Only scan new images
    const newRects = rects.filter(({ image }) => !scannedImages[image.id]);

    // No new images
    if (newRects.length === 0) {
      console.debug("There are no new images");
      setIsScanning(false);
      return;
    }

    // Critical Section
    setIsScanning(true);
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
        setProgress((p) => (p += 1));
      }
    );

    const newHistory = res
      .map(processResult)
      .reduce<WishHistoryList>(historyReducer, {
        character_event_wish: [],
        weapon_event_wish: [],
        permanent_wish: [],
        beginners_wish: [],
        chronicled_wish: [],
      });

    sortWishHistory(newHistory);

    console.debug({ newHistory });
    saveHistory(newHistory);

    // Set scanned images only after data state is set
    // to avoid data anomalies
    setScannedImages((oldImages) => ({
      ...oldImages,
      ...rects.reduce<{ [hash: string]: boolean }>((acc, cur) => {
        acc[cur.image.id] = true;
        return acc;
      }, {}),
    }));

    // Empty the images to scan state
    setRects([]);

    await scheduler.terminate();

    setIsScanning(false);
  }

  return (
    <>
      {allImagesLoaded && !isScanning && !allImagesScanned && (
        <button type="button" onClick={handleClick}>
          Scan
        </button>
      )}

      {isScanning && (
        <>
          <p>{`Scanned ${progress} out of ${rects.length} images`}</p>
          <progress value={progress + 1} max={rects.length} />
        </>
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
