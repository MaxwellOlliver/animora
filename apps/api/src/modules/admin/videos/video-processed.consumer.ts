import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENTS, VideoProcessedEvent } from '@animora/contracts';
import { HandleVideoProcessedUseCase } from './use-cases/handle-video-processed.use-case';

@Controller()
export class VideoProcessedConsumer {
  constructor(
    private readonly handleVideoProcessedUseCase: HandleVideoProcessedUseCase,
  ) {}

  @EventPattern(EVENTS.VIDEO_PROCESSED)
  handle(@Payload() event: VideoProcessedEvent): void {
    this.handleVideoProcessedUseCase.execute(event);
  }
}
