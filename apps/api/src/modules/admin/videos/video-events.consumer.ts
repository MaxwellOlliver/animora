import type {
  VideoTranscodedEvent,
  VideoTranscodeFailedEvent,
} from '@animora/contracts';
import { EVENTS } from '@animora/contracts';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { HandleVideoTranscodeFailedUseCase } from './use-cases/handle-video-transcode-failed.use-case';
import { HandleVideoTranscodedUseCase } from './use-cases/handle-video-transcoded.use-case';

@Controller()
export class VideoEventsConsumer {
  private readonly logger = new Logger(VideoEventsConsumer.name);

  constructor(
    private readonly handleVideoTranscodedUseCase: HandleVideoTranscodedUseCase,
    private readonly handleVideoTranscodeFailedUseCase: HandleVideoTranscodeFailedUseCase,
  ) {}

  @EventPattern(EVENTS.VIDEO_TRANSCODED)
  onTranscoded(
    @Payload() event: VideoTranscodedEvent,
    @Ctx() context: RmqContext,
  ): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      this.handleVideoTranscodedUseCase.execute(event);
      channel.ack(message);
    } catch (err) {
      this.logger.error('Failed to handle VIDEO_TRANSCODED', err);
      channel.nack(message, false, false);
    }
  }

  @EventPattern(EVENTS.VIDEO_TRANSCODE_FAILED)
  onTranscodeFailed(
    @Payload() event: VideoTranscodeFailedEvent,
    @Ctx() context: RmqContext,
  ): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      this.handleVideoTranscodeFailedUseCase.execute(event);
      channel.ack(message);
    } catch (err) {
      this.logger.error('Failed to handle VIDEO_TRANSCODE_FAILED', err);
      channel.nack(message, false, false);
    }
  }
}
