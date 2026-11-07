import { Injectable, signal } from '@angular/core';
import { StreamStats, Video } from '../models/video.model';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  // null until the first response, so an empty list can be told apart from "still loading".
  private videos = new BehaviorSubject<Video[] | null>(null);
  videos$ = this.videos.asObservable();
  /** True when the first load failed, so the page can tell it apart from an empty catalog. */
  readonly loadFailed = signal(false);


  constructor(private apiService: ApiService) { }

  loadVideos(): void {
    this.apiService.getVideos().subscribe({
      next: (videos) => {
        this.sortVideosByDate(videos);
        this.loadFailed.set(false);
        this.videos.next(videos);
      },
      error: (error) => {
        console.error('Failed to load videos', error);
        // A failed reload keeps the list already shown; only the first load ends with an empty one.
        // Stays set through failed retries until a list has loaded.
        this.loadFailed.set(this.loadFailed() || this.videos.value === null);
        this.videos.next(this.videos.value ?? []);
      }
    });
  }

  getStreams(videoId: number): Observable<StreamStats[]> {
    return this.apiService.getStreams(videoId).pipe(map(response => response.streams));
  }

  /** Forgets the list on an account switch, so no other account's uploads are shown. */
  clear(): void {
    this.loadFailed.set(false);
    this.videos.next(null);
  }

  private sortVideosByDate(videos: Video[]): void {
    videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

}
