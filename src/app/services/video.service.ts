import { Injectable } from '@angular/core';
import { Video, CategorizedVideos } from '../models/video.model';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private videos = new BehaviorSubject<Video[]>([]);
  videos$ = this.videos.asObservable();

  private categorizedVideos = new BehaviorSubject<CategorizedVideos>({});
  categorizedVideos$ = this.categorizedVideos.asObservable();
  

  constructor(private apiService: ApiService) { }

  loadVideos(): void {
    this.apiService.getVideos().subscribe({
      next: (videos) => {
        this.sortVideosById(videos);
        this.videos.next(videos);
        this.categorizeVideos(videos);
      },
      error: (error) => {
        console.error('Failed to load videos', error);
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



  

  private sortVideosById(videos: Video[]): void {
    videos.sort((a, b) => a.id - b.id);
  }
}
