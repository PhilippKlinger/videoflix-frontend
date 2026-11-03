import { Injectable } from '@angular/core';
import { Video, CategorizedVideos } from '../models/video.model';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  // null until the first response, so an empty list can be told apart from "still loading".
  private videos = new BehaviorSubject<Video[] | null>(null);
  videos$ = this.videos.asObservable();

  private categorizedVideos = new BehaviorSubject<CategorizedVideos>({});
  categorizedVideos$ = this.categorizedVideos.asObservable();


  constructor(private apiService: ApiService) { }

  loadVideos(): void {
    this.apiService.getVideos().subscribe({
      next: (videos) => {
        this.sortVideosByDate(videos);
        this.videos.next(videos);
        this.categorizeVideos(videos);
      },
      error: (error) => {
        console.error('Failed to load videos', error);
        this.videos.next([]);
      }
    });
  }

  private categorizeVideos(videos: Video[]): void {
    const categorized: CategorizedVideos = {};
    videos.forEach(video => {
      if (!categorized[video.category]) {
        categorized[video.category] = [];
      }
      categorized[video.category].push(video);
    });
    this.categorizedVideos.next(categorized);
  }

  private sortVideosByDate(videos: Video[]): void {
    videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

}
