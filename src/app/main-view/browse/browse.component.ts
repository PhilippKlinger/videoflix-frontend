import { Component, OnInit, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { VideoService } from 'src/app/services/video.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Video } from 'src/app/models/video.model';
import { Role } from 'src/app/models/user.model';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { MyVideosComponent } from '../my-videos/my-videos.component';
import { VideoPlayerComponent } from 'src/app/video-player/video-player.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';


@Component({
  standalone: true,
  selector: 'app-browse',
  imports: [
    CommonModule,
    MaterialModule,
    MainLayoutComponent,
    MyVideosComponent,
  ],
  templateUrl: './browse.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  /** Videos grouped by genre */
  genreMap: { [genre: string]: Video[] } = {};
  /** Dynamic order of the genres */
  genreOrder: string[] = [];
  /** Newest videos */
  newestVideos: Video[] = [];
  /** Own uploads, shown only in "My videos" */
  ownVideos: Video[] = [];
  /** Hero-Video */
  featured?: Video;
  loading = true;
  role: Role | null = null;

  videoService = inject(VideoService);
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authService.loadCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => this.role = user.role,
        // Without the role the catalog still works; banner and "My videos" stay hidden.
        error: error => console.error('Failed to load the current user', error),
      });

    this.videoService.loadVideos();
    this.videoService.videos$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((videos) => {
        if (videos === null) return;

        this.ownVideos = videos.filter(v => v.is_own);
        const catalog = videos.filter(v => !v.is_own);

        // Newest 10 videos
        this.newestVideos = [...catalog]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);

        // Featured = first element
        this.featured = this.newestVideos[0];

        // Extract and group genres (the backend calls the genre "category")
        const genres = Array.from(new Set(catalog.map(v => v.category))).sort();
        this.genreOrder = genres;
        this.genreMap = {};
        genres.forEach(g => {
          this.genreMap[g] = catalog.filter(v => v.category === g);
        });

        this.loading = false;
      });
  }

  /** Admin uploads become standard videos, so admins have no own uploads. */
  get showMyVideos(): boolean {
    return this.role !== null && this.role !== 'admin';
  }

  reload(): void {
    this.videoService.loadVideos();
  }

  /** Opens the player as a dialog */
  playVideo(video: Video): void {
    this.dialog.open(VideoPlayerComponent, {
      data: { video },
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: 'video-dialog-panel',
      hasBackdrop: true,
      autoFocus: false
    });
  }

  favoriteVideo(video: Video) {
    console.log('Favorited:', video);
  }

  openDetails(video: Video) {
    console.log('Open details for:', video);
  }
}
