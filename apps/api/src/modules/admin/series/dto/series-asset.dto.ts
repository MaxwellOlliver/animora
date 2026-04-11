export const SERIES_ASSET_PURPOSES = [
  'banner',
  'logo',
  'trailer',
  'poster',
] as const;
export type SeriesAssetPurpose = (typeof SERIES_ASSET_PURPOSES)[number];
