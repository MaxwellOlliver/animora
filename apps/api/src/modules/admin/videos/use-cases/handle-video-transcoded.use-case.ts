import type { VideoTranscodedEvent } from '@animora/contracts';
import { Injectable } from '@nestjs/common';

import { VideoEventsService } from '../video-events.service';

@Injectable()
export class HandleVideoTranscodedUseCase {
  constructor(private readonly videoEventsService: VideoEventsService) {}

  execute(event: VideoTranscodedEvent): void {
    this.videoEventsService.emit(event.videoId, 'ready');
  }
}
