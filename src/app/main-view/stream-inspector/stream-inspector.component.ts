import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { StreamStats } from 'src/app/models/video.model';
import { formatBitrate, formatSegments, formatSize } from 'src/app/models/video-tech';
import { UnderTheHoodService } from 'src/app/services/under-the-hood.service';
import { VideoService } from 'src/app/services/video.service';

/** Real stream statistics of one video; only shown, and only requested, while "Under the hood" is on. */
@Component({
  standalone: true,
  selector: 'app-stream-inspector',
  templateUrl: './stream-inspector.component.html',
  styleUrls: ['./stream-inspector.component.scss'],
})
export class StreamInspectorComponent {
  videoId = input.required<number>();
  readonly hood = inject(UnderTheHoodService);
  private videoService = inject(VideoService);

  /** null until the response arrives. */
  streams = signal<StreamStats[] | null>(null);
  failed = signal(false);
  private requested = false;

  readonly formatBitrate = formatBitrate;
  readonly formatSegments = formatSegments;
  readonly formatSize = formatSize;

  constructor() {
    effect(() => {
      if (!this.hood.enabled() || this.requested) return;
      this.requested = true;
      untracked(() => this.load(this.videoId()));
    });
  }

  private load(videoId: number): void {
    this.videoService.getStreams(videoId).subscribe({
      next: streams => this.streams.set(streams),
      error: error => {
        console.error('Failed to load stream details', error);
        this.failed.set(true);
      },
    });
  }
}
