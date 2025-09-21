import {
  Fragment,
  useCallback,
  useRef,
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
import { Modal } from "../../../components/Modal.tsx";

interface ScannerProps {
  images: WishImage[];
  setImages: Dispatch<SetStateAction<WishImage[]>>;
  scannedImages: { [hash: string]: boolean };
  setScannedImages: Dispatch<SetStateAction<{ [hash: string]: boolean }>>;
  saveHistory: (newHistory: WishHistory) => void;
  processedImages: { [hash: string]: ScanRegions };
  setProcessedImages: Dispatch<SetStateAction<{ [hash: string]: ScanRegions }>>;
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
  const [error, setError] = useState<Error | null>(null);
  const errorModalRef = useRef<HTMLDialogElement | null>(null);

  // There was an error processing the image
  if (error) {
    console.error(error.cause);
    errorModalRef.current?.showModal();
  }

  // Happy path
  const scanQueue = Object.values(processedImages).filter(
    ({ image }) => !scannedImages[image.id]
  );

  const allImagesLoaded =
    scanQueue.length >= images.length;

  const allImagesScanned = scanQueue.length === 0;

  if (allImagesLoaded) {
    console.debug("Loaded all images");
  }

  console.log({
    sc: Object.values(scannedImages).length,
    sq: scanQueue.length,
    i: images.length,
    p: Object.values(processedImages).length,
  });

  const handleErrorModalClose = useCallback(() => {
    setImages([]);
    setError(null);
  }, [setImages]);

  const clearScanQueue = useCallback(() => {
    setIsScanning(false);
    setImages([]);
    setProgress(1);
  }, [setImages]);

  // Image Processing
  const handleLoad = useCallback(
    async (hash: string) => {
      try {
        if (processedImages[hash] || scannedImages[hash]) {
          console.debug("Already processed");
          setImages((prevImages) =>
            prevImages.filter((image) => image.hash !== hash)
          );
          return;
        }

        const inputEl = document.querySelector<HTMLImageElement>("#" + hash);
        const canvasEl = document.querySelector<HTMLCanvasElement>(
          "#" + "canvas" + "_" + hash
        );

        if (inputEl === null || canvasEl === null)
          throw new Error("Can't find image to process");

        const newScanRegion = await getScanRegion(inputEl, canvasEl);

        setProcessedImages((prevHashes) => ({
          ...prevHashes,
          [hash]: newScanRegion,
        }));
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      }
    },
    [setImages, scannedImages, processedImages, setProcessedImages]
  );

  // Function to handle scanning
  const handleClick = useCallback(async () => {
    if (isScanning) {
      console.debug("Already scanning");
      return;
    }
    console.debug("clicked", { scanQueue });

    // No new images
    if (scanQueue.length === 0) {
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
      scanQueue,
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
      ...scanQueue.reduce<{ [hash: string]: boolean }>((acc, cur) => {
        acc[cur.image.id] = true;
        return acc;
      }, {}),
    }));

    // Cleanup
    // Reset scan state
    clearScanQueue();
    await scheduler.terminate();
    setIsScanning(false);
  }, [isScanning, saveHistory, scanQueue, setScannedImages, clearScanQueue]);

  return (
    <>
      <p>Images to scan {scanQueue.length}</p>
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

      <Modal
        className="modal error-modal"
        ref={errorModalRef}
        onClose={handleErrorModalClose}
      >
        {error?.message || "There was an error processing the image"}
        <button onClick={() => errorModalRef.current?.close()}>Okay</button>
      </Modal>
    </>
  );
}

export default Scanner;
