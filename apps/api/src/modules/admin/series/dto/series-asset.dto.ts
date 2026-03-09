export const SERIES_ASSET_PURPOSES = ['banner', 'logo', 'trailer'] as const;
export type SeriesAssetPurpose = (typeof SERIES_ASSET_PURPOSES)[number];
