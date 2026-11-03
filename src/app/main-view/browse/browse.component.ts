import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VideoService } from 'src/app/services/video.service';
import { Video } from 'src/app/models/video.model';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
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
  /** Hero-Video */
  featured?: Video;
  loading = true;

  videoService = inject(VideoService);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.videoService.loadVideos();
    this.videoService.videos$.subscribe((videos) => {
      if (!videos.length) return;

      // Newest 10 videos
      this.newestVideos = [...videos]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      // Featured = first element
      this.featured = this.newestVideos[0];

      // Extract and group genres (the backend calls the genre "category")
      const genres = Array.from(new Set(videos.map(v => v.category))).sort();
      this.genreOrder = genres;
      this.genreMap = {};
      genres.forEach(g => {
        this.genreMap[g] = videos.filter(v => v.category === g);
      });

      this.loading = false;
    });
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
