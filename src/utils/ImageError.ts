export class ImageError extends Error {
  image: HTMLImageElement;

  constructor(message: string, image: HTMLImageElement) {
    super(message);
    this.image = image;
  }
}
