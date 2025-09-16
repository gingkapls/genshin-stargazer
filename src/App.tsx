import { useReducer } from "react";
import "./App.css";
import FolderPicker from "./components/FolderPicker.tsx";
import type { WishHistory } from "./components/wishHistory";
import type { parsedHistoryPage } from "./lib/parseData.ts";

// TODO: move somewhere better
function convertToKey(
  wishType: parsedHistoryPage["wishType"]
): keyof WishHistory {
  return wishType
    .toLowerCase()
    .split(" ")
    .join("_")
    .replaceAll("-", "_") as keyof WishHistory;
}

function reducer(state: WishHistory, action: { pages: parsedHistoryPage[] }) {
  // TODO: make it more readable maybe?
  return action.pages.reduce<WishHistory>(
    (acc, cur) => {
      const wishType = convertToKey(cur.wishType);

      const hasPage: boolean =
        acc[wishType].findIndex(({ pageHash }) => cur.pageHash === pageHash) !==
        -1;

      // TODO: Implement wish merging algorithm
      // to not add duplicates
      acc[wishType] = hasPage ? acc[wishType] : acc[wishType].concat(cur);

      return acc;
    },
    { ...state }
  );
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
