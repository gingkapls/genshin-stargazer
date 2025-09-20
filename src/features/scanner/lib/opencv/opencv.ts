import cvReadyPromise, { type CV } from "@techstark/opencv-js";

export async function getOpenCv() {
  const cv = await cvReadyPromise;
  return cv;
}

export function translateException(cv: CV, err: unknown) {
  if (typeof err === "number") {
    try {
      const exception = cv.exceptionFromPtr(err);
      return exception;
    } catch (error) {
        return error;
    }
  }
  return err;
}