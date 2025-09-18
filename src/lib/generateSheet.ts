import { utils, writeFileXLSX } from "xlsx";

export function generateSheet(tables: (HTMLTableElement | null)[]) {
  if (!tables || tables.length === 0) return;
  const workbook = utils.book_new();
  const [characterEvent, weaponEvent, standard, chronicled] = tables.map(
    (table) => utils.table_to_sheet(table)
  );

  const information = utils.aoa_to_sheet([
    ["Paimon.moe Wish History Export"],
    ["Version", 3],
    ["Export Date", "2025-09-15 08:47:17"],
  ]);

  utils.book_append_sheet(workbook, characterEvent, "Character Event");
  utils.book_append_sheet(workbook, weaponEvent, "Weapon Event");
  utils.book_append_sheet(workbook, standard, "Standard");

  utils.book_append_sheet(workbook, information, "Information");

  writeFileXLSX(workbook, "test.xlsx");
}
