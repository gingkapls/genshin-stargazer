import { useReducer, useRef, useState } from "react";
import "./App.css";
import FolderPicker from "./components/FolderPicker.tsx";
import type { WishHistoryList } from "./components/wishHistory";
import { mergeHistories } from "./lib/historyReducer.ts";
import { WishTable } from "./components/WishTable.tsx";
import { generateSheet } from "./lib/generateSheet.ts";
import { useLocalStorage } from "./hooks/useLocalStorage.tsx";

// TODO: Implement LocalStorage
function App() {
  function saveHistory(newHistory: WishHistoryList) {
    // TODO: make it more readable maybe?
    //
    setHistory((prevHistory) => mergeHistories(prevHistory, newHistory));
  }

  const [history, setHistory] = useLocalStorage<WishHistoryList>("history", {
    character_event_wish: [],
    weapon_event_wish: [],
    permanent_wish: [],
    beginners_wish: [],
    chronicled_wish: [],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const tables = useRef<Array<HTMLTableElement>>(null!);

  if (tables.current === null) {
    tables.current = [];
  }

  console.log(tables.current.map((el) => el.caption));

  return (
    <>
      <button onClick={() => generateSheet(tables.current)}>Export</button>
      <FolderPicker saveHistory={saveHistory} />
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
