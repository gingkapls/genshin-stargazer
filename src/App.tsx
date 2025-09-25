import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage.tsx";
import { mergeHistories } from "./features/dataParser/historyReducer.ts";
import type { WishHistory } from "./types/Wish.types.ts";
import { createEmptyWishHistory } from "./utils/createEmptyWishHistory.ts";
import { ImagePicker } from "./components/ImagePicker.tsx";
import { generateSheet } from "./features/wishTable/utils/generateSheet.ts";
import type { EventToTable } from "./types/Table.types.ts";
import { WishTable } from "./features/wishTable/components/WishTable.tsx";
import { Modal } from "./components/Modal.tsx";
import Scanner from "./features/scanner/components/Scanner.tsx";
import type {
  Images,
  ProcessedImages,
  ScannedImages,
} from "./types/State.type.ts";
import { Instructions } from "./components/Instructions.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getScheduler } from "./features/scanner/utils/Scheduler.ts";

function App() {
  function saveHistory(newHistory: WishHistory) {
    setHistory((prevHistory) => mergeHistories(prevHistory, newHistory));
  }

  function handleClearHistory() {
    if (clearHistoryDialogRef.current === null) return;
    setHistory(createEmptyWishHistory());
    setScannedImages({});
    clearHistoryDialogRef.current.close();
    window.location.reload();
  }
  const [history, setHistory] = useLocalStorage<WishHistory>(
    "history",
    createEmptyWishHistory()
  );

  const [scannedImages, setScannedImages] = useLocalStorage<ScannedImages>(
    "scannedImages",
    {}
  );

  const [processedImages, setProcessedImages] = useState<ProcessedImages>({});

  const [images, setImages] = useState<Images>({});

  const [activeTab, setActiveTab] = useState("character_event_wish");

  const tablesRef = useRef<EventToTable>(null);
  const clearHistoryDialogRef = useRef<HTMLDialogElement>(null);

  const getTables = () => {
    if (tablesRef.current === null) {
      tablesRef.current = {};
    }

    return tablesRef.current;
  };



  // Free tesseract memory on page unload
  useEffect(() => {
    document.addEventListener("visibilitychange", async (e: Event) => {
      if (e.currentTarget === null) return;
      if (e.currentTarget instanceof Document) {
        if (e.currentTarget.visibilityState === "hidden") {
          console.log("unloaded");
          const scheduler = await getScheduler();
          await scheduler.terminate();
        }
      }
    });
  }, []);

  return (
    <>
      <main>
        <header>
          <div className="toolbar">
            <h1>
              <AutoAwesomeIcon /> Wish History Scanner
            </h1>
            <button
              className="btn btn-export"
              onClick={() => generateSheet(tablesRef.current)}
            >
              Export <FileDownloadIcon />
            </button>
            <ImagePicker setImages={setImages} images={images} />
            <Scanner
              processedImages={processedImages}
              setProcessedImages={setProcessedImages}
              images={images}
              setImages={setImages}
              scannedImages={scannedImages}
              setScannedImages={setScannedImages}
              saveHistory={saveHistory}
            />

            <button
              className="btn btn-delete"
              onClick={() => clearHistoryDialogRef.current?.showModal()}
            >
              Delete history <DeleteIcon />
            </button>
          </div>
          <div className="wish-type-container">
            <h3>Wish Type</h3>
            <select
              name="events"
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {Object.keys(history).map((event) => (
                <option key={event} value={event}>
                  {event.split("_").join(" ")} ({history[event].length})
                </option>
              ))}
            </select>
          </div>
          <Instructions />
        </header>

        {Object.entries(history).map(([event, wishes], i) => (
          <WishTable
            key={wishes[0]?.wishType || i}
            ref={(el: HTMLTableElement) => {
              const t = getTables();
              t[event] = el;

              return () => {
                t[event] = null;
              };
            }}
            wishes={wishes}
            isActive={event === activeTab}
          />
        ))}
      </main>
      <Modal
        title="Delete data"
        className="delete-modal"
        ref={clearHistoryDialogRef}
      >
        Do you want to delete your history?
        <div className="modal-actions">
          <button
            className="btn"
            onClick={() => clearHistoryDialogRef.current?.close()}
          >
            No
          </button>
          <button className="btn btn-delete" onClick={handleClearHistory}>
            Yes
          </button>
        </div>
      </Modal>
    </>
  );
}

export default App;
