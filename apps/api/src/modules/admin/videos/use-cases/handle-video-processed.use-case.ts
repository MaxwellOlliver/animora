import type { VideoProcessedEvent } from '@animora/contracts';
import { Injectable } from '@nestjs/common';

import { VideoEventsService } from '../video-events.service';

@Injectable()
export class HandleVideoProcessedUseCase {
  constructor(private readonly videoEventsService: VideoEventsService) {}

  execute(event: VideoProcessedEvent): void {
    this.videoEventsService.emit(event.videoId, event.status);
  }
}
