import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Roles } from '@/common/decorators/roles.decorator';

import { DeleteVideoUseCase } from './use-cases/delete-video.use-case';
import { GetVideoUseCase } from './use-cases/get-video.use-case';
import { VideoEventsService } from './video-events.service';
import { VideosRepository } from './videos.repository';

const TERMINAL = new Set(['ready', 'failed']);

@ApiTags('Admin / Videos')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/videos')
export class VideosAdminController {
  constructor(
    private readonly deleteVideoUseCase: DeleteVideoUseCase,
    private readonly getVideoUseCase: GetVideoUseCase,
    private readonly videoEventsService: VideoEventsService,
    private readonly videosRepository: VideosRepository,
  ) {}

  @Get('episode/:episodeId')
  @ApiOperation({ summary: 'Get video by episode ID' })
  async getByEpisode(@Param('episodeId', ParseUUIDPipe) episodeId: string) {
    const video = await this.videosRepository.findByEpisodeId(episodeId);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a video' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteVideoUseCase.execute(id);
  }

  @Sse(':id/status/stream')
  @ApiOperation({ summary: 'Stream video status changes via SSE' })
  statusStream(
    @Param('id', ParseUUIDPipe) videoId: string,
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const sub = this.videoEventsService.forVideo(videoId).subscribe({
        next: (event) => {
          subscriber.next(event);
          if (TERMINAL.has((event.data as { status: string }).status)) {
            subscriber.complete();
          }
        },
      });

      this.getVideoUseCase
        .execute(videoId)
        .then((video) => {
          subscriber.next({ data: { status: video.status } });
          if (TERMINAL.has(video.status)) {
            subscriber.complete();
          }
        })
        .catch((err) => subscriber.error(err));

      return () => sub.unsubscribe();
    });
  }
}
