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

function App() {
  function saveHistory(newHistory: WishHistory) {
    setHistory((prevHistory) => mergeHistories(prevHistory, newHistory));
  }

  const [history, setHistory] = useLocalStorage<WishHistory>(
    "history",
    createEmptyWishHistory()
  );

  const [activeTab, setActiveTab] = useState("character_event_wish");
  const tablesRef = useRef<EventToTable>(null!);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (tablesRef.current === null) {
    tablesRef.current = {};
  }

  return (
    <>
      <Modal title="Delete data" ref={dialogRef}>
        Hello
        <button onClick={() => dialogRef.current?.close()}>No</button>
        <button onClick={() => dialogRef.current?.close()}>Yes</button>
      </Modal>
      <button onClick={() => dialogRef.current?.showModal()}>
        Show dialog
      </button>

      <button onClick={() => generateSheet(tablesRef.current)}>Export</button>
      <ImagePicker saveHistory={saveHistory} />
      <div>
        {Object.keys(history).map((event) => (
          <label key={event}>
            <input
              type="radio"
              defaultChecked={event === activeTab}
              name="active_tab"
              value={event}
              onChange={(e) => setActiveTab(event)}
            />
            {event.split("_").join(" ")}
          </label>
        ))}
      </div>
      {Object.entries(history).map(([event, wishes], i) => (
        <WishTable
          key={wishes[0]?.wishType || i}
          ref={(el: HTMLTableElement) => (tablesRef.current[event] = el)}
          wishes={wishes}
          isActive={event === activeTab}
        />
      ))}
    </>
  );
}

export default App;
