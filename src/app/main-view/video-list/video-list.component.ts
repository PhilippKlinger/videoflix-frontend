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
    return `${baseUrl}${ videoPath }`;
  }

  showThumbnailUrl(thumbnailPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${ thumbnailPath }`;
  }

  openVideoDetails(videoPath: string) {
  
  }


}

