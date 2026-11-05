import { Injectable } from '@angular/core';
import { Video } from '../models/video.model';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  // null until the first response, so an empty list can be told apart from "still loading".
  private videos = new BehaviorSubject<Video[] | null>(null);
  videos$ = this.videos.asObservable();


  constructor(private apiService: ApiService) { }

  loadVideos(): void {
    this.apiService.getVideos().subscribe({
      next: (videos) => {
        this.sortVideosByDate(videos);
        this.videos.next(videos);
      },
      error: (error) => {
        console.error('Failed to load videos', error);
        // A failed reload keeps the list already shown; only the first load ends with an empty one.
        this.videos.next(this.videos.value ?? []);
      }
    });
  }

  /** Forgets the list on an account switch, so no other account's uploads are shown. */
  clear(): void {
    this.videos.next(null);
  }

  private sortVideosByDate(videos: Video[]): void {
    videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

}
