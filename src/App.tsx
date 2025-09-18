import { useReducer, useRef, useState } from "react";
import "./App.css";
import FolderPicker from "./components/FolderPicker.tsx";
import type { WishHistoryList } from "./components/wishHistory";
import { mergeHistories } from "./lib/historyReducer.ts";
import { WishTable } from "./components/WishTable.tsx";

function reducer(
  state: WishHistoryList,
  action: { newHistory: WishHistoryList }
) {
  // TODO: make it more readable maybe?
  //
  return mergeHistories(state, action.newHistory);
}

// TODO: Implement LocalStorage
function App() {
  const [data, dispatch] = useReducer<
    WishHistoryList,
    [Parameters<typeof reducer>[1]]
  >(reducer, {
    character_event_wish: [],
    weapon_event_wish: [],
    permanent_wish: [],
    chronicled_wish: [],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  console.log(activeIndex)

  console.log("App: ", { data });
  return (
    <>
      <FolderPicker dispatch={dispatch} />
      <div>
        {Object.keys(data).map((event, i) => (
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
      {Object.values(data).map((wishes, i) => (
        <WishTable
          key={wishes[0]?.wishType || i}
          wishes={wishes}
          isActive={i === activeIndex}
        />
      ))}
    </>
  );
}

export default App;
