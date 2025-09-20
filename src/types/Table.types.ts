import type { WishHistory } from "./Wish.types.ts";

export interface EventToTable {
  [key: keyof WishHistory]: HTMLTableElement;
}
