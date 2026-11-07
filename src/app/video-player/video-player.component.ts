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
  // True from the start of a stream until the browser can play it.
  loading = true;
  // Not every browser can put an element into fullscreen (iPhone).
  readonly canFullscreen = document.fullscreenEnabled;
  private hls: Hls | null = null;
  // Created once, even if a resolution change starts while hls.js is still loading.
  private hlsReady: Promise<Hls | null> | null = null;
  private destroyed = false;

  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

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
    this.destroyed = true;
    this.hls?.destroy();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
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
    this.loading = true;
    await this.loadStream();
  }

  onCanPlay(): void {
    this.loading = false;
  }

  /** The video element itself failed, for example on a broken native HLS stream. */
  onVideoError(): void {
    this.showPlaybackError();
  }

  onLoadedMetadata(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement && this.resumeAt !== null) {
      videoElement.currentTime = this.resumeAt;
    }
    this.resumeAt = null;
  }

  /**
   * The player lives in a MatDialog inside the CDK overlay container, and its menus open there too.
   * Only the whole page as fullscreen element keeps dialog, close button and resolution menu visible.
   */
  fullscreenTarget(): HTMLElement {
    return document.documentElement;
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      this.fullscreenTarget().requestFullscreen().catch(() => {});
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    // Firefox ignores controlsList and a double click fullscreens the bare video:
    // move fullscreen to the page so close and resolution stay reachable.
    if (document.fullscreenElement && document.fullscreenElement === this.videoPlayer?.nativeElement) {
      document.exitFullscreen()
        .then(() => this.fullscreenTarget().requestFullscreen())
        .catch(() => {});
    }
    this.isFullscreen = document.fullscreenElement === this.fullscreenTarget();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private async start(): Promise<void> {
    try {
      // hls.js loads past the HTTP interceptors: this request refreshes an expired access cookie first.
      await firstValueFrom(this.api.getMe());
    } catch {
      if (!this.destroyed) this.showPlaybackError();
      return;
    }
    await this.loadStream();
  }

  private async loadStream(): Promise<void> {
    const videoElement = this.videoPlayer?.nativeElement;
    if (this.destroyed || !videoElement || !this.selectedResolution) return;
    const hls = await this.getHls(videoElement);
    // The player may have closed or failed while hls.js was loading.
    if (this.destroyed || this.playbackError || !this.selectedResolution) return;
    const url = this.streamUrl(this.selectedResolution);
    if (hls) {
      hls.loadSource(url);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = url;
    } else {
      this.showPlaybackError();
    }
  }

  private getHls(videoElement: HTMLVideoElement): Promise<Hls | null> {
    this.hlsReady ??= this.createHls().then(hls => {
      if (!hls) return null;
      if (this.destroyed) {
        hls.destroy();
        return null;
      }
      hls.attachMedia(videoElement);
      // Value of Hls.Events.ERROR; the enum itself is only available after the lazy import.
      hls.on('hlsError' as Events.ERROR, (_event: Events.ERROR, data: ErrorData) => {
        if (data.fatal) this.showPlaybackError();
      });
      this.hls = hls;
      return hls;
    });
    return this.hlsReady;
  }

  private showPlaybackError(): void {
    this.playbackError = true;
    this.loading = false;
    this.hls?.destroy();
    this.hls = null;
    this.changeDetector.markForCheck();
  }
}
