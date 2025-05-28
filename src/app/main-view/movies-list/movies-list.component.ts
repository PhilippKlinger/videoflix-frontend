import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from 'src/app/models/profile.model';
import { Video, CategorizedVideos } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';
import { VideoService } from 'src/app/services/video.service';
import { SelectProfileService } from 'src/app/services/select-profile.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoPlayerComponent } from 'src/app/video-player/video-player.component';

@Component({
    selector: 'app-movies-list',
    templateUrl: './movies-list.component.html',
    styleUrls: ['./movies-list.component.scss'],
    standalone: false
})
export class MoviesListComponent implements OnInit, OnDestroy {
  categorizedVideos: CategorizedVideos = {};
  categories: string[] = ['Movie'];
  hoveredIndex: number = -1;
  selectedProfile!: Profile | null;
  private unsubscribe$ = new Subject<void>();

  constructor(private apiService: ApiService,
    private router: Router,
    private videoService: VideoService,
    private profileService: SelectProfileService,
    private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.profileService.selectedProfile$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      profile => {
        this.selectedProfile = profile;
      }
    );

    this.videoService.categorizedVideos$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (categorizedVideos) => {
        this.categorizedVideos = categorizedVideos;
      },
      error: (error) => {
        console.error('Failed to load categorized videos', error);
      }
    });
    this.videoService.loadVideos();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  openDialog(video: Video): void {
    this.dialog.open(VideoPlayerComponent, {
      width: '80%',
      height: '80%',
      data: { video }
    });
  }

}
