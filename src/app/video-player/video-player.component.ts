import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Video } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss'],
    standalone: false
})
export class VideoPlayerComponent implements OnInit {
  video!: Video;
  selectedResolution: string = '2160p';
  videoUrl: string = '';

  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;


  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<VideoPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { video: Video }
  ) { }

  ngOnInit(): void {
    this.video = this.data.video;
    this.sortResolutionsDescending();
    this.setVideoUrl();
  }

  sortResolutionsDescending(): void {
    this.video.resolutions.sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution));
  }

  setVideoUrl(): void {
    if (this.selectedResolution === '2160p') {
      this.videoUrl = this.showVideoUrl(this.video.video_file);
    } else {
      const resolution = this.video.resolutions.find(res => res.resolution === this.selectedResolution);
      if (resolution) {
        this.videoUrl = this.showVideoUrl(resolution.converted_file);
      }
    }
    this.updateVideoSource();
  }

  showVideoUrl(videoPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${videoPath}`;
  }

  onResolutionChange(resolution: string): void {
    this.selectedResolution = resolution;
    this.setVideoUrl();
  }

  updateVideoSource(): void {
    const videoElement = this.videoPlayer.nativeElement;
    const currentTime = videoElement.currentTime;
    videoElement.src = this.videoUrl;
    videoElement.load();
    videoElement.onloadeddata = () => {
      videoElement.currentTime = currentTime; // Set the current time after loading the new source
      videoElement.play().catch(error => console.error('Error playing video:', error));
    };
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
