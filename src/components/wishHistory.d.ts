import type { Wish } from "../lib/parseData.ts";

export interface WishHistoryList {
  character_event_wish: Wish[];
  weapon_event_wish: Wish[];
  permanent_wish: Wish[];
  beginners_wish: Wish[];
  chronicled_wish: Wish[];
}