export interface ScanRegions {
  image: HTMLCanvasElement;
  rectangles: Tesseract.Rectangle[];
  pageRectangle: Tesseract.Rectangle;
}

export interface bbox {
  TOP_RATIO: number;
  LEFT_RATIO: number;
  WIDTH_RATIO: number;
  HEIGHT_RATIO: number;
}

export interface ScanResult {
  itemName: string[];
  wishType: string[];
  timeReceived: string[];
  pageNumber: string[];
}
