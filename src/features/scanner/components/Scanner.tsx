import {
  Fragment,
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { scanImages } from "../utils/scanImages.ts";
import type { ScanRegions } from "../utils/scan.types.ts";
import { processHistory } from "../../dataParser/processHistory.ts";
import { Scheduler } from "../utils/Scheduler.ts";
import type { WishHistory, WishImage } from "../../../types/Wish.types.ts";
import { getScanRegion } from "../../imageProcessor/processImage.ts";

interface ScannerProps {
  images: WishImage[];
  setImages: Dispatch<SetStateAction<WishImage[]>>;
  scannedImages: { [hash: string]: boolean };
  setScannedImages: Dispatch<SetStateAction<{ [hash: string]: boolean }>>;
  saveHistory: (newHistory: WishHistory) => void;
  processedImages: { [hash: string]: boolean };
  setProcessedImages: Dispatch<SetStateAction<{ [hash: string]: boolean }>>;
}

function Scanner({
  images,
  setImages,
  scannedImages,
  setScannedImages,
  processedImages,
  setProcessedImages,
  saveHistory,
}: ScannerProps) {
  const [progress, setProgress] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  const [scanQueue, setScanQueue] = useState<ScanRegions[]>([]);

  const allImagesLoaded =
    images.length !== 0 && scanQueue.length === images.length;

  const allImagesScanned = scanQueue.length === 0;

  if (allImagesLoaded) {
    console.debug("Loaded all images");
  }
  console.log({ i: images.length, sq: scanQueue.length });

  const clearScanQueue = useCallback(() => {
    setIsScanning(false);
    setScanQueue([]);
    setImages([]);
    setProgress(1);
  }, [setScanQueue, setImages]);

  // Image Processing
  const handleLoad = useCallback(
    async (hash: string) => {
      if (processedImages[hash]) {
        console.debug("Already processed");
        return;
      }

      const inputEl = document.querySelector<HTMLImageElement>("#" + hash);
      const canvasEl = document.querySelector<HTMLCanvasElement>(
        "#" + "canvas" + "_" + hash
      );

      if (inputEl === null || canvasEl === null)
        throw new Error("Can't find image to process");

      const newScanRegion = await getScanRegion(inputEl, canvasEl);

      setScanQueue((prevQueue) => prevQueue.concat(newScanRegion));
      setProcessedImages((prevHashes) => ({
        ...prevHashes,
        [hash]: true,
      }));
    },
    [processedImages, setProcessedImages]
  );

  // Function to handle scanning
  const handleClick = useCallback(async () => {
    if (isScanning) {
      console.debug("Already scanning");
      return;
    }
    console.debug("clicked", { scanQueue });

    // Only scan new images
    const newScanQueue = scanQueue.filter(
      ({ image }) => !scannedImages[image.id]
    );

    // No new images
    if (newScanQueue.length === 0) {
      console.debug("There are no new images");
      clearScanQueue();
      return;
    }

    // Critical Section
    setIsScanning(true);
    console.debug("Start time", new Date());

    const scheduler = new Scheduler();
    await scheduler.initialize();

    const scanResults = await scanImages(
      newScanQueue,
      scheduler,
      (region: ScanRegions) => {
        console.debug("Scanning image", region.image.id);
        setProgress((p) => (p += 1));
      }
    );

    const newHistory = processHistory(scanResults);

    console.debug({ newHistory });
    saveHistory(newHistory);

    // Set scanned images only after data state is set
    // to avoid inconsistent cache
    setScannedImages((oldImages) => ({
      ...oldImages,
      // Reducing our array of newly scanned rectangles into a object of hashes
      ...newScanQueue.reduce<{ [hash: string]: boolean }>((acc, cur) => {
        acc[cur.image.id] = true;
        return acc;
      }, {}),
    }));

    // Reset scan state
    clearScanQueue();

    // Cleanup
    await scheduler.terminate();

    setIsScanning(false);
  }, [isScanning, saveHistory, scanQueue, scannedImages, setScannedImages, clearScanQueue]);

  return (
    <>
      {allImagesLoaded && !isScanning && !allImagesScanned && (
        <button type="button" onClick={handleClick}>
          Scan
        </button>
      )}

      {isScanning && (
        <>
          <p>{`Scanning image #${progress} out of ${scanQueue.length} images`}</p>
          <progress value={progress} max={scanQueue.length} />
        </>
      )}

      <section className="images">
        {images.map((image) => (
          <Fragment key={image.hash}>
            <img
              className="src_image"
              id={image.hash}
              src={image.src}
              alt="sample"
              onLoad={() => handleLoad(image.hash)}
            ></img>
            <canvas id={"canvas" + "_" + image.hash} className="out_image" />
          </Fragment>
        ))}
      </section>
    </>
  );
}

export default Scanner;
