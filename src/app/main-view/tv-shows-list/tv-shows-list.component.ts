import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Video, CategorizedVideos } from 'src/app/models/video.model';
import { ApiService } from 'src/app/services/api.service';
import { VideoService } from 'src/app/services/video.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoPlayerComponent } from 'src/app/video-player/video-player.component';

@Component({
    selector: 'app-tv-shows-list',
    templateUrl: './tv-shows-list.component.html',
    styleUrls: ['./tv-shows-list.component.scss'],
    standalone: false
})
export class TvShowsListComponent implements OnInit, OnDestroy {
  categorizedVideos: CategorizedVideos = {};
  categories: string[] = ['TV-Show'];
  hoveredIndex: number = -1;

  private unsubscribe$ = new Subject<void>();

  constructor(private apiService: ApiService,
    private router: Router,
    private videoService: VideoService,

    private dialog: MatDialog,) { }

  ngOnInit(): void {
    

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

 

  openDialog(video: Video): void {
    this.dialog.open(VideoPlayerComponent, {
      width: '80%',
      height: '80%',
      data: { video }
    });
  }

}
