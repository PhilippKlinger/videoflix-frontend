import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Video } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';
import { VideoService } from 'src/app/services/video.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoPlayerComponent } from 'src/app/video-player/video-player.component';

@Component({
    selector: 'app-favorite-list',
    templateUrl: './favorite-list.component.html',
    styleUrls: ['./favorite-list.component.scss'],
    standalone: false
})
export class FavoriteListComponent implements OnInit, OnDestroy {
  favoriteVideos: Video[] = [];
  hoveredIndex: number = -1;
  private unsubscribe$ = new Subject<void>();

  constructor(private apiService: ApiService, private router: Router, private videoService: VideoService, private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.videoService.videos$.pipe(takeUntil(this.unsubscribe$)).subscribe(videos => {

        // this.favoriteVideos = this.videoService.getFavoritedVideos();
      
    });
    this.videoService.loadVideos();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  hoverVideo(index: number): void {
    this.hoveredIndex = index;
  }

  showVideoUrl(videoPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${videoPath}`;
  }

  showThumbnailUrl(thumbnailPath: string): string {
    const baseUrl = this.apiService.baseUrl;
    return `${baseUrl}${thumbnailPath}`;
  }

  // toggleFavorite(video: Video): void {
  //   if (this.selectedProfile) {
  //     this.videoService.toggleFavorite(video, this.selectedProfile.id);
  //   }
  // }

  // isFavorite(video: Video): boolean {
  //   if (!this.selectedProfile) return false;
  //   return video.favorited_by.some(profile => profile.id === this.selectedProfile?.id);
  // }
  
  openDialog(video: Video): void {
    this.dialog.open(VideoPlayerComponent, {
      width: '80%',
      height: '80%',
      data: { video }
    });
  }
}
