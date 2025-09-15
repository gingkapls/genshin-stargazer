import type { parsedHistoryPage } from "../lib/parseData.ts";

export interface WishHistory {
  character_event_wish: parsedHistoryPage[];
  weapon_event_wish: parsedHistoryPage[];
  permanent_wish: parsedHistoryPage[];
  chronicled_wish: parsedHistoryPage[];
}
