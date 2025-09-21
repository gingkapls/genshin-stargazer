import { useRef, useState } from "react";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage.tsx";
import { mergeHistories } from "./features/dataParser/historyReducer.ts";
import type { WishHistory, WishImage } from "./types/Wish.types.ts";
import { createEmptyWishHistory } from "./lib/createEmptyWishHistory.ts";
import { ImagePicker } from "./components/ImagePicker.tsx";
import { generateSheet } from "./features/wishTable/utils/generateSheet.ts";
import type { EventToTable } from "./types/Table.types.ts";
import { WishTable } from "./features/wishTable/components/WishTable.tsx";
import { Modal } from "./components/Modal.tsx";
import Scanner from "./features/scanner/components/Scanner.tsx";
import type { ScanRegions } from "./features/scanner/utils/scan.types.ts";

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

  const [scannedImages, setScannedImages] = useLocalStorage<{
    [hash: string]: boolean;
  }>("scannedImages", {});

  const [processedImages, setProcessedImages] = useState<{
    [hash: string]: ScanRegions;
  }>({});

  const [images, setImages] = useState<WishImage[]>([]);

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
    <>
      <div>
        <Modal title="Delete data" ref={clearHistoryDialogRef}>
          Do you want to delete your history?
          <button onClick={() => clearHistoryDialogRef.current?.close()}>
            No
          </button>
          <button onClick={handleClearHistory}>Yes</button>
        </Modal>
        <button onClick={() => clearHistoryDialogRef.current?.showModal()}>
          Delete history
        </button>
      </div>

      <button onClick={() => generateSheet(tablesRef.current)}>Export</button>
      <ImagePicker setImages={setImages} images={images} />
      <div>
        <select name="events" onChange={(e) => setActiveTab(e.target.value)}>
          {Object.keys(history).map((event) => (
            <option
              key={event}
              value={event}
            >
              {event.split("_").join(" ")} ({history[event].length})
            </option>
          ))}
        </select>
      </div>
      <Scanner
        processedImages={processedImages}
        setProcessedImages={setProcessedImages}
        images={images}
        setImages={setImages}
        scannedImages={scannedImages}
        setScannedImages={setScannedImages}
        saveHistory={saveHistory}
      />
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
    </>
  );
}

export default App;
