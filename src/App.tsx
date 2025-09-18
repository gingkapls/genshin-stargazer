import { useReducer } from "react";
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
    character_event_wish_2: [],
    weapon_event_wish: [],
    permanent_wish: [],
    chronicled_wish: [],
  });

  console.log("App: ", { data });
  return (
    <>
      {/* <WishTable wishes={data.character_event_wish} /> */}
      {/* <WishTable wishes={data.character_event_wish_2} /> */}
      {/* <WishTable wishes={data.weapon_event_wish} /> */}
      {/* <WishTable wishes={data.chronicled_wish} /> */}
      <WishTable wishes={data.permanent_wish} />
      <FolderPicker dispatch={dispatch} />
    </>
  );
}

export default App;
