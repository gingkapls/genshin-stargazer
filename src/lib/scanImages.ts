import { createWorker, PSM } from "tesseract.js";

const rectangle = {
  top: 640,
  left: 761,
  height: 91,
  width: 341,
} as const;

export async function scanImage(imageSrc: string) {
  const worker = await createWorker("eng");
  worker.setParameters({tessedit_pageseg_mode: PSM.SINGLE_BLOCK})
  const ret = await worker.recognize(imageSrc, { rectangle});
  await worker.terminate();
  console.log(ret.data.text);
  return ret.data.text;
}
