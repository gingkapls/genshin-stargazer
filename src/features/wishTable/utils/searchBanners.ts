import type { BannerList } from "../banners.types.ts";

// Binary search adapted to work with in-between values
function searchBanners(banners: BannerList, timeReceived: number): number {
  if (timeReceived < banners[0][0]) return 0;
  if (timeReceived > banners[banners.length - 1][0]) return banners.length - 1;

  let left = 0;
  let right = banners.length - 1;
  let mid = -1;

  while (left <= right) {
    mid = Math.floor((left + right) / 2);
    // Exact match is found
    if (banners[mid][0] === timeReceived) break;

    // Value is between predecessor and successor
    // We return the index just lower than mid
    if (banners[mid][0] < timeReceived && timeReceived < banners[mid + 1][0]) break;

    if (banners[mid][0] < timeReceived) {
      // Split search space by shifting left pointer to right of mid
      left = mid + 1;
    } else {
      // Split search space by shifting right pointer to left of mid
      right = mid - 1;
    }
  }

  return mid;
}

export { searchBanners };
