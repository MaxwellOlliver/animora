import type { VideoTranscodeFailedEvent } from '@animora/contracts';
import { Injectable, Logger } from '@nestjs/common';

import { VideoEventsService } from '../video-events.service';

@Injectable()
export class HandleVideoTranscodeFailedUseCase {
  private readonly logger = new Logger(HandleVideoTranscodeFailedUseCase.name);

  constructor(private readonly videoEventsService: VideoEventsService) {}

  execute(event: VideoTranscodeFailedEvent): void {
    this.logger.warn(
      `Video ${event.videoId} transcode failed: ${event.reason}`,
    );
    this.videoEventsService.emit(event.videoId, 'failed');
  }
}
