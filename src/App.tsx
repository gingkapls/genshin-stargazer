import { useEffect, useRef, useState } from "react";
import wish_full from "./assets/full-wish.webp";
import wish_small from "./assets/wish.jpg";
import "./App.css";
import { scanImage } from "./lib/scanImages.ts";
import { processImage } from "./lib/processImage.ts";
import Tesseract from "tesseract.js";
import Scanner from "./components/Scanner.tsx";

function App() {
  return (
    <>
      <Scanner imageSrc={wish_small} />
      <Scanner imageSrc={wish_full} />
    </>
  );
}

export default App;
