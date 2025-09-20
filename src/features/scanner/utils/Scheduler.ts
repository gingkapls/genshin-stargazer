import { createScheduler, createWorker, PSM } from "tesseract.js";

export class Scheduler {
  static COLUM_PARAMS = {
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890():-' \n",
  };

  static PAGE_PARAMS = {
    tessedit_pageseg_mode: PSM.RAW_LINE,
    tessedit_char_whitelist: "0123456789 \n",
    preserve_interword_spaces: "1",
  };

  scheduler: Tesseract.Scheduler;
  pageWorker!: Tesseract.Worker;

  constructor() {
    this.scheduler = createScheduler();
  }

  async initialize(callback?: () => void) {
    const workers = await Promise.all(
      Array(10)
        .fill(0)
        .map(() => createWorker("eng"))
    );

    for await (const worker of workers) {
      worker.setParameters(Scheduler.COLUM_PARAMS);
    }

    const pageWorker = await createWorker("eng");
    await pageWorker.setParameters(Scheduler.PAGE_PARAMS);

    if (typeof callback === "function") callback();

    workers.forEach((worker) => {
      this.scheduler.addWorker(worker);
    });

    this.pageWorker = pageWorker;

    return this;
  }

  async terminate() {
    await this.scheduler.terminate();
    await this.pageWorker.terminate();
  }
}
