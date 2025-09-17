import type { parsedHistoryPage, Wish } from "../lib/parseData.ts";

export interface WishHistoryList {
  character_event_wish: Wish[];
  character_event_wish_2: Wish[];
  weapon_event_wish: Wish[];
  permanent_wish: Wish[];
  chronicled_wish: Wish[];
}

export interface WishHistoryTable {
  character_event_wish: parsedHistoryPage[];
  character_event_wish_2: parsedHistoryPage[];
  weapon_event_wish: parsedHistoryPage[];
  permanent_wish: parsedHistoryPage[];
  chronicled_wish: parsedHistoryPage[];
}
