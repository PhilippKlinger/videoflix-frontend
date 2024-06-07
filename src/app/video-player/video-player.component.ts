import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Video } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {
  video!: Video;
  selectedResolution: string = '4K';
  videoUrl: string = '';

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<VideoPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { video: Video }
  ) { }

  ngOnInit(): void {
    this.video = this.data.video;
    this.setVideoUrl();
  }

  setVideoUrl(): void {
    if (this.selectedResolution === '4K') {
      this.videoUrl = this.showVideoUrl(this.video.video_file);
    } else {
      const resolution = this.video.resolutions.find(res => res.resolution === this.selectedResolution);
      if (resolution) {
        this.videoUrl = this.showVideoUrl(resolution.converted_file);
      }
    }
  }

  showVideoUrl(videoPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${videoPath}`;
  }

  updateVideoQuality(resolution: string): void {
    this.selectedResolution = resolution;
    this.setVideoUrl();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
