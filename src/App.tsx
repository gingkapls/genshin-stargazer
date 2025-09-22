import { useRef, useState } from "react";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage.tsx";
import { mergeHistories } from "./features/dataParser/historyReducer.ts";
import type { WishHistory } from "./types/Wish.types.ts";
import { createEmptyWishHistory } from "./lib/createEmptyWishHistory.ts";
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

  return (
    <main>
      <Modal title="Delete data" ref={clearHistoryDialogRef}>
        Do you want to delete your history?
        <button onClick={() => clearHistoryDialogRef.current?.close()}>
          No
        </button>
        <button onClick={handleClearHistory}>Yes</button>
      </Modal>

      <header>
        <div className="toolbar">
          <h1>Wish History Scanner</h1>
          <button
            className="btn btn-export"
            onClick={() => generateSheet(tablesRef.current)}
          >
            Export
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
            Delete history
          </button>
        </div>
        <div className="wish-type-container">
          <h3>Wish Type</h3>
          <select name="events" onChange={(e) => setActiveTab(e.target.value)}>
            {Object.keys(history).map((event) => (
              <option key={event} value={event}>
                {event.split("_").join(" ")} ({history[event].length})
              </option>
            ))}
          </select>
        </div>
        <section className="instructions">
          <p>
            ※ You can upload screenshots of your Genshin Impact in-game wish
            history to export them. The images can be added to the queue one by
            one or multiple at a time until you press the scan button. The
            images are processed as soon as they are added. The export button
            exports the wish history as an excel spreadsheet that can be used
            imported into wish trackers.
          </p>
          <p>
            If an image can not be processed, you will get an error and that
            upload batch will be discarded. Please open an issue on github along
            with the image if that image was a valid wish history screenshot.
          </p>
          <p>All the processing is done on your device, no data is uploaded.</p>
        </section>
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
  );
}

export default App;
