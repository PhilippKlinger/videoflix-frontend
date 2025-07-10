import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VideoService } from 'src/app/services/video.service';
import { Video } from 'src/app/models/video.model';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { VideoPlayerComponent } from 'src/app/video-player/video-player.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { environment } from 'src/app/environments/environment';


@Component({
  standalone: true,
  selector: 'app-browse',
  imports: [
    CommonModule,
    MaterialModule,
    MainLayoutComponent,
  ],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  /** Videos gruppiert nach Genre */
  genreMap: { [genre: string]: Video[] } = {};
  /** Dynamische Reihenfolge der Genres */
  genreOrder: string[] = [];
  /** Neueste Videos */
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

      // Neueste 10 Videos
      this.newestVideos = [...videos]
        .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
        .slice(0, 10);

      // Featured = erstes Element
      this.featured = this.newestVideos[0];

      // Genres extrahieren und gruppieren
      const genres = Array.from(new Set(videos.map(v => v.genre))).sort();
      this.genreOrder = genres;
      this.genreMap = {};
      genres.forEach(g => {
        this.genreMap[g] = videos.filter(v => v.genre === g);
      });

      this.loading = false;
    });
  }

  /** Öffnet den Player als Dialog */
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

  /** Baut die vollständige URL für Thumbnails und Videos */
  getMediaUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${environment.mediaBaseUrl.replace(/\/$/, '')}${path}`;
  }

  /** Für’s Template: direktes Thumbnail holen */
  getThumbnailUrl(path: string): string {
    return this.getMediaUrl(path);
  }

  favoriteVideo(video: Video) {
    console.log('Favorited:', video);
  }

  openDetails(video: Video) {
    console.log('Open details for:', video);
  }
}
