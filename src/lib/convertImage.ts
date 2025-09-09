import { getOpenCv } from "./opencv.ts";

export async function processImage(image: HTMLImageElement , greyImage: HTMLCanvasElement) {
    const cv = await getOpenCv();
    const img = cv.imread(image);
    const imgGray = new cv.Mat();
    
    cv.cvtColor(img, imgGray, cv.COLOR_BGR2GRAY);
    cv.imshow(greyImage, imgGray)
    
    // release resources
    img.delete();
    imgGray.delete();
}
