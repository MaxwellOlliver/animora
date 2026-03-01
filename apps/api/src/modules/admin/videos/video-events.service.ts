import { Injectable } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface VideoStatusEvent {
  videoId: string;
  status: string;
}

@Injectable()
export class VideoEventsService {
  private readonly subject = new Subject<VideoStatusEvent>();

  emit(videoId: string, status: string): void {
    this.subject.next({ videoId, status });
  }

  forVideo(videoId: string): Observable<MessageEvent> {
    return this.subject.asObservable().pipe(
      filter((e) => e.videoId === videoId),
      map((e) => ({ data: { status: e.status } }) as MessageEvent),
    );
  }
}
