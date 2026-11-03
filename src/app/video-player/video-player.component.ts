import { Component, Inject, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
// Type only: the library is loaded on demand and stays out of the start bundle.
import type Hls from 'hls.js';
import type { ErrorData, Events } from 'hls.js';
import { MaterialModule } from '../material/material.module';
import { Video } from 'src/app/models/video.model';
import { ApiService } from '../services/api.service';
import { environment } from '../environments/environment';

/** 720p starts fast and looks good; without it the lower one wins over 1080p. */
const START_ORDER = ['720p', '480p', '1080p'];

export function pickStartResolution(available: string[]): string | null {
  return START_ORDER.find(res => available.includes(res)) ?? available[0] ?? null;
}

@Component({
  standalone: true,
  selector: 'app-video-player',
  imports: [
    MaterialModule
  ],
  templateUrl: './video-player.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  video!: Video;
  resolutions: string[] = [];
  selectedResolution: string | null = null;
  // Position to restore after switching the resolution.
  resumeAt: number | null = null;
  isFullscreen = false;
  playbackError = false;
  // Not every browser can put an element into fullscreen (iPhone).
  readonly canFullscreen = document.fullscreenEnabled;
  private hls: Hls | null = null;

  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('playerOverlay', { static: true }) playerOverlay!: ElementRef<HTMLElement>;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { video: Video },
    private api: ApiService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.video = this.data.video;
    this.resolutions = (this.video.resolutions ?? [])
      .map(r => r.resolution)
      .sort((a, b) => parseInt(b) - parseInt(a));
    this.selectedResolution = pickStartResolution(this.resolutions);
    document.body.style.overflow = 'hidden';
  }

  ngAfterViewInit(): void {
    if (this.selectedResolution) {
      this.start();
    }
  }

  ngOnDestroy(): void {
    this.hls?.destroy();
    document.body.style.overflow = '';
  }

  /** Loads hls.js on demand; null where the browser lacks Media Source Extensions (Safari plays HLS natively). */
  async createHls(): Promise<Hls | null> {
    const { default: HlsJs } = await import('hls.js');
    return HlsJs.isSupported() ? new HlsJs() : null;
  }

  streamUrl(resolution: string): string {
    return `${environment.apiUrl}/video/${this.video.id}/${resolution}/index.m3u8`;
  }

  async onResolutionChange(resolution: string): Promise<void> {
    if (resolution === this.selectedResolution) return;
    // A second switch before the first one loaded must not lose the original position.
    this.resumeAt ??= this.videoPlayer?.nativeElement.currentTime ?? null;
    this.selectedResolution = resolution;
    await this.loadStream();
  }

  onLoadedMetadata(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement && this.resumeAt !== null) {
      videoElement.currentTime = this.resumeAt;
    }
    this.resumeAt = null;
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      this.playerOverlay.nativeElement.requestFullscreen().catch(() => {});
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    // Firefox ignores controlsList and a double click fullscreens the bare video:
    // move fullscreen to the overlay so close and resolution stay reachable.
    if (document.fullscreenElement && document.fullscreenElement === this.videoPlayer?.nativeElement) {
      document.exitFullscreen()
        .then(() => this.playerOverlay.nativeElement.requestFullscreen())
        .catch(() => {});
    }
    this.isFullscreen = document.fullscreenElement === this.playerOverlay.nativeElement;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private async start(): Promise<void> {
    try {
      // hls.js loads past the HTTP interceptors: this request refreshes an expired access cookie first.
      await firstValueFrom(this.api.getMe());
    } catch {
      this.showPlaybackError();
      return;
    }
    await this.loadStream();
  }

  private async loadStream(): Promise<void> {
    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement || !this.selectedResolution) return;
    const url = this.streamUrl(this.selectedResolution);
    if (!this.hls) {
      this.hls = await this.createHls();
      if (this.hls) {
        this.hls.attachMedia(videoElement);
        this.hls.on('hlsError' as Events.ERROR, (_event: Events.ERROR, data: ErrorData) => {
          if (data.fatal) this.showPlaybackError();
        });
      }
    }
    if (this.hls) {
      this.hls.loadSource(url);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = url;
    } else {
      this.showPlaybackError();
    }
  }

  private showPlaybackError(): void {
    this.playbackError = true;
    this.hls?.destroy();
    this.hls = null;
    this.changeDetector.markForCheck();
  }
}
