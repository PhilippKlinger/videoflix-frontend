import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { Video } from 'src/app/models/video.model';
import { toAbsoluteUrl } from 'src/app/utils/url-utils';

@Component({
  standalone: true,
  selector: 'app-video-player',
  imports: [
    CommonModule,
    MaterialModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {
  video!: Video;
  selectedResolution: string = '2160p';
  videoUrl: string = '';

  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { video: Video }
  ) {}

  ngOnInit(): void {
    this.video = this.data.video;
    if (this.video.resolutions?.length) {
      this.video.resolutions.sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution));
    }
    this.setVideoUrl();
    document.body.style.overflow = 'hidden';
  }
  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  setVideoUrl(): void {
    if (this.selectedResolution === '2160p' || !this.video.resolutions?.length) {
      this.videoUrl = toAbsoluteUrl(this.video.video_file);
    } else {
      const res = this.video.resolutions.find(r => r.resolution === this.selectedResolution);
      this.videoUrl = res ? toAbsoluteUrl(res.converted_file) : toAbsoluteUrl(this.video.video_file);
    }
    this.updateVideoSource();
  }

  onResolutionChange(resolution: string): void {
    this.selectedResolution = resolution;
    this.setVideoUrl();
  }

  updateVideoSource(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement) return;
    const currentTime = videoElement.currentTime || 0;
    videoElement.src = this.videoUrl;
    videoElement.load();
    videoElement.onloadeddata = () => {
      try { videoElement.currentTime = currentTime; } catch {}
      videoElement.play().catch(() => {});
    };
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
