import { useRef, useState } from "react";
import "./App.css";
import { WishTable } from "./components/WishTable.tsx";
import { useLocalStorage } from "./hooks/useLocalStorage.tsx";
import { mergeHistories } from "./features/dataParser/historyReducer.ts";
import type { WishHistory } from "./types/Wish.types.ts";
import { createEmptyWishHistory } from "./lib/createEmptyWishHistory.ts";
import { ImagePicker } from "./components/ImagePicker.tsx";
import { generateSheet } from "./features/wishTable/utils/generateSheet.ts";
import type { EventToTable } from "./types/Table.types.ts";

function App() {
  function saveHistory(newHistory: WishHistory) {
    setHistory((prevHistory) => mergeHistories(prevHistory, newHistory));
  }

  const [history, setHistory] = useLocalStorage<WishHistory>(
    "history",
    createEmptyWishHistory()
  );

  const [activeTab, setActiveTab] = useState("character_event_wish");
  const tables = useRef<EventToTable>(null!);

  if (tables.current === null) {
    tables.current = {};
  }

  return (
    <>
      <button onClick={() => generateSheet(tables.current)}>Export</button>
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
          ref={(el: HTMLTableElement) => (tables.current[event] = el)}
          wishes={wishes}
          isActive={event === activeTab}
        />
      ))}
    </>
  );
}

export default App;
