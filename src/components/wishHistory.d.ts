import type { Wish } from "../lib/parseData.ts";

export interface WishHistory {
  character_event_wish: Wish[];
  character_event_wish_2: Wish[];
  weapon_event_wish: Wish[];
  permanent_wish: Wish[];
  chronicled_wish: Wish[];
}
