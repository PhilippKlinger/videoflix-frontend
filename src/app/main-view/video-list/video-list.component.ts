import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Video } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent {
  videos: Video[] = [];
  hoveredIndex: number = -1;

  constructor(private apiService: ApiService, private router: Router,) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.apiService.getVideos().subscribe({
      next: (videos) => {
        this.videos = videos;
        console.log(this.videos)
      },
      error: (error) => {
        console.error('Failed to load videos', error);
      }
    });
  }

  showVideoUrl(videoPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${videoPath}`;
  }

  showThumbnailUrl(thumbnailPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${thumbnailPath}`;
  }

  hoverVideo(index: number): void {
    this.hoveredIndex = index;
  }

  playVideo(videoPath: string): void {
    const videoUrl = this.showVideoUrl(videoPath);
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.controls = true;
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    document.body.appendChild(videoElement);
    videoElement.requestFullscreen();
    videoElement.play();

    videoElement.onfullscreenchange = () => {
      if (!document.fullscreenElement) {
        videoElement.remove();
      }
    };
  }

}

