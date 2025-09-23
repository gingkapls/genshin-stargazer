import type { WorkSheet } from "xlsx";

function getRange(end: string): [number, number] {
  const [lastCol, lastRow] = end.split(/(\d*)/);
  // 65 = A
  // + 1 to index from 1
  return [lastCol.charCodeAt(0) - 65 + 1, Number(lastRow)];
}

function getRows(columnName: string, numRows: number = 1) {
  // 1 indexed
  return Array.from({ length: numRows }, (_, i) => columnName + (i + 1));
}

function getCols(numCols: number) {
  // 65 = A
  // 1 indexed
  return Array.from({ length: numCols }, (_, i) => String.fromCharCode(65 + i));
}

function getSingleMaxColumnWidth(
  worksheet: WorkSheet,
  columnName: string,
  numRows: number
) {
  return {
    // + 1 for padding for good measure
    // We OR by 0 in cases where the cell is empty
    wch:
      getRows(columnName, numRows).reduce(
        (maxWidth, r) =>
          Math.max(maxWidth, String(worksheet[r]?.v || 0).length),
        0
      ) + 1,
  };
}

function getMaxColumnWidths(worksheet: WorkSheet) {
  // Range is in the format "A1:I6" for example
  const ref = worksheet["!fullref"] || worksheet["!ref"];

  const end = ref.split(":")[1];
  const [numCols, numRows] = getRange(end);

  return getCols(numCols).map((col) =>
    getSingleMaxColumnWidth(worksheet, col, numRows)
  );
}

export { getMaxColumnWidths };
