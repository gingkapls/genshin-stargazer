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
import type { WishHistory } from "../../../types/Wish.types.ts";
import { getScanRegion } from "../../imageProcessor/processImage.ts";
import { Modal } from "../../../components/Modal.tsx";
import type {
  Images,
  ProcessedImages,
  ScannedImages,
} from "../../../types/State.type.ts";

interface ScannerProps {
  images: Images;
  setImages: Dispatch<SetStateAction<Images>>;
  scannedImages: ScannedImages;
  setScannedImages: Dispatch<SetStateAction<ScannedImages>>;
  saveHistory: (newHistory: WishHistory) => void;
  processedImages: ProcessedImages;
  setProcessedImages: Dispatch<SetStateAction<ProcessedImages>>;
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
    (region) => !scannedImages[region.image.id]
  );

  console.log(processedImages);
  console.log(scannedImages);

  const allImagesLoaded = Object.keys(images).every(
    (hash) => processedImages[hash]
  );

  const allImagesScanned = scanQueue.length === 0;

  console.log(allImagesLoaded);

  if (allImagesLoaded) {
    console.debug("Loaded all images");
  }

  console.log({
    sc: Object.values(scannedImages).length,
    sq: scanQueue.length,
    i: Object.values(images).length,
    p: Object.values(processedImages).length,
  });

  const handleErrorModalClose = useCallback(() => {
    setImages({});
    setError(null);
  }, [setImages]);

  const clearScanQueue = useCallback(() => {
    setIsScanning(false);
    setImages({});
    setProgress(1);
  }, [setImages]);

  // Image Processing
  const handleLoad = useCallback(
    async (hash: string) => {
      try {
        if (processedImages[hash]) {
          console.debug("Already processed");

          setImages((prevImages) => {
            const res = { ...prevImages };
            delete res[hash];
            return res;
          });

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
    [setImages, processedImages, setProcessedImages]
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

  // TODO: Implement Loading indicator while processing
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
        {Object.entries(images).map(([hash, src]) => (
          <Fragment key={hash}>
            <img
              className="src_image"
              id={hash}
              src={src}
              alt="sample"
              onLoad={() => handleLoad(hash)}
            ></img>
            <canvas id={"canvas" + "_" + hash} className="out_image" />
          </Fragment>
        ))}
      </section>

      <Modal
        className="modal error-modal"
        ref={errorModalRef}
        onClose={handleErrorModalClose}
      >
        {(error?.message || "There was an error processing the image") + " Please reupload the images"}
        <img
          height="320px"
          src={error?.cause?.src}
          alt="error-image"
          className="error-image"
        />
        <button onClick={() => errorModalRef.current?.close()}>Okay</button>
      </Modal>
    </>
  );
}

export default Scanner;
