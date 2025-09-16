import { useReducer } from "react";
import "./App.css";
import FolderPicker from "./components/FolderPicker.tsx";
import type { WishHistory } from "./components/wishHistory";
import type { parsedHistoryPage } from "./lib/parseData.ts";
import { historyReducer } from "./lib/historyReducer.ts";

function reducer(state: WishHistory, action: { pages: parsedHistoryPage[] }) {
  // TODO: make it more readable maybe?
  return action.pages.reduce<WishHistory>(historyReducer, { ...state });
}

// TODO: Implement LocalStorage
function App() {
  const [data, dispatch] = useReducer<
    WishHistory,
    [Parameters<typeof reducer>[1]]
  >(reducer, {
    character_event_wish: [],
    character_event_wish_2: [],
    weapon_event_wish: [],
    permanent_wish: [],
    chronicled_wish: [],
  });

  console.log("App: ", { data });

  return (
    <>
      <FolderPicker dispatch={dispatch} />
    </>
  );
}

export default App;
