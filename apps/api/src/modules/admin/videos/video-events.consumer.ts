import type {
  VideoTranscodedEvent,
  VideoTranscodeFailedEvent,
} from '@animora/contracts';
import { EVENTS } from '@animora/contracts';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { HandleVideoTranscodedUseCase } from './use-cases/handle-video-transcoded.use-case';
import { HandleVideoTranscodeFailedUseCase } from './use-cases/handle-video-transcode-failed.use-case';

@Controller()
export class VideoEventsConsumer {
  constructor(
    private readonly handleVideoTranscodedUseCase: HandleVideoTranscodedUseCase,
    private readonly handleVideoTranscodeFailedUseCase: HandleVideoTranscodeFailedUseCase,
  ) {}

  @EventPattern(EVENTS.VIDEO_TRANSCODED)
  async onTranscoded(@Payload() event: VideoTranscodedEvent): Promise<void> {
    this.handleVideoTranscodedUseCase.execute(event);
  }

  @EventPattern(EVENTS.VIDEO_TRANSCODE_FAILED)
  async onTranscodeFailed(
    @Payload() event: VideoTranscodeFailedEvent,
  ): Promise<void> {
    this.handleVideoTranscodeFailedUseCase.execute(event);
  }
}
