import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from 'src/app/models/profile.model';
import { Video } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';
import { VideoService } from 'src/app/services/video.service';
import { SelectProfileService } from 'src/app/services/select-profile.service';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit, OnDestroy {
  videos: Video[] = [];
  hoveredIndex: number = -1;
  selectedProfile!: Profile | null;
  private unsubscribe$ = new Subject<void>();
  
  constructor(private apiService: ApiService, private router: Router, private videoService: VideoService, private profileService: SelectProfileService) { }

  ngOnInit(): void {
    this.profileService.selectedProfile$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      profile => {
        this.selectedProfile = profile;
      } 
    );

    this.videoService.videos$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (videos) => {
        this.videos = videos;
      },
      error: (error) => {
        console.error('Failed to load videos', error);
      }
    });
    this.videoService.loadVideos();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  toggleFavorite(video: Video): void {
 
    if (this.selectedProfile) {
      this.videoService.toggleFavorite(video, this.selectedProfile.id);
    }
  }

  isFavorite(video: Video): boolean {
    if (!this.selectedProfile) return false;
    return video.favorited_by.some(profile => profile.id === this.selectedProfile?.id);
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

