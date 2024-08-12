import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Video } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-random-video-preview',
  templateUrl: './random-video-preview.component.html',
  styleUrls: ['./random-video-preview.component.scss']
})
export class RandomVideoPreviewComponent implements OnInit, OnDestroy {
  @Input() videos: Video[] = [];
  randomVideo: Video | undefined;
  private unsubscribe$ = new Subject<void>();

  constructor(private videoService: VideoService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.videoService.categorizedVideos$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (categorizedVideos) => {
        this.videos = [
          ...(categorizedVideos['Movie'] || []),
          ...(categorizedVideos['TV-Show'] || [])
        ];
        this.setRandomVideo();
      },
      error: (error) => {
        console.error('Failed to load categorized videos', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setRandomVideo(): void {
    if (this.videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.videos.length);
      this.randomVideo = this.videos[randomIndex];
    }
  }

  showVideoUrl(videoPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${videoPath}`;
  }

  showThumbnailUrl(thumbnailPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${thumbnailPath}`;
  }
}
