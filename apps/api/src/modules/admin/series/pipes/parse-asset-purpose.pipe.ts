import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import {
  SERIES_ASSET_PURPOSES,
  type SeriesAssetPurpose,
} from '../dto/series-asset.dto';

@Injectable()
export class ParseAssetPurposePipe implements PipeTransform {
  transform(value: string): SeriesAssetPurpose {
    if (!SERIES_ASSET_PURPOSES.includes(value as SeriesAssetPurpose)) {
      throw new BadRequestException(
        `Invalid asset purpose. Allowed: ${SERIES_ASSET_PURPOSES.join(', ')}`,
      );
    }
    return value as SeriesAssetPurpose;
  }
}
