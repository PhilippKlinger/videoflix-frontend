import { Component, Inject, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Hls from 'hls.js';
import { MaterialModule } from '../material/material.module';
import { Video } from 'src/app/models/video.model';
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
  private hls: Hls | null = null;

  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('playerOverlay', { static: true }) playerOverlay!: ElementRef<HTMLElement>;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { video: Video }
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
    this.loadStream();
  }

  ngOnDestroy(): void {
    this.hls?.destroy();
    document.body.style.overflow = '';
  }

  /** Separate method so tests can replace the third-party player. */
  createHls(): Hls {
    return new Hls();
  }

  streamUrl(resolution: string): string {
    return `${environment.apiUrl}/video/${this.video.id}/${resolution}/index.m3u8`;
  }

  onResolutionChange(resolution: string): void {
    const videoElement = this.videoPlayer?.nativeElement;
    this.resumeAt = videoElement?.currentTime ?? null;
    this.selectedResolution = resolution;
    this.loadStream();
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

  private loadStream(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement || !this.selectedResolution) return;
    const url = this.streamUrl(this.selectedResolution);
    if (Hls.isSupported()) {
      if (!this.hls) {
        this.hls = this.createHls();
        this.hls.attachMedia(videoElement);
      }
      this.hls.loadSource(url);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari plays HLS natively.
      videoElement.src = url;
    }
  }
}
