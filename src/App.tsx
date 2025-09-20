import { useRef, useState } from "react";
import "./App.css";
import { WishTable } from "./components/WishTable.tsx";
import { generateSheet } from "./features/tableGenerator/generateSheet.ts";
import { useLocalStorage } from "./hooks/useLocalStorage.tsx";
import { mergeHistories } from "./features/dataParser/historyReducer.ts";
import type { WishHistory } from "./types/Wish.types.ts";
import { createEmptyWishHistory } from "./lib/createEmptyWishHistory.ts";
import { ImagePicker } from "./components/ImagePicker.tsx";

function App() {
  function saveHistory(newHistory: WishHistory) {
    setHistory((prevHistory) => mergeHistories(prevHistory, newHistory));
  }

  const [history, setHistory] = useLocalStorage<WishHistory>(
    "history",
    createEmptyWishHistory()
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const tables = useRef<Array<HTMLTableElement>>(null!);

  if (tables.current === null) {
    tables.current = [];
  }

  return (
    <>
      <button onClick={() => generateSheet(tables.current)}>Export</button>
      <ImagePicker saveHistory={saveHistory} />
      <div>
        {Object.keys(history).map((event, i) => (
          <label key={event}>
            <input
              type="radio"
              defaultChecked={i === 0}
              name="active_tab"
              value={i}
              onChange={(e) => setActiveIndex(Number(e.target.value))}
            />
            {event.split("_").join(" ")}
          </label>
        ))}
      </div>
      {Object.values(history).map((wishes, i) => (
        <WishTable
          key={wishes[0]?.wishType || i}
          ref={(el: HTMLTableElement) => (tables.current[i] = el)}
          wishes={wishes}
          isActive={i === activeIndex}
        />
      ))}
    </>
  );
}

export default App;
