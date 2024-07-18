import { Injectable } from '@angular/core';
import { Video, CategorizedVideos } from '../models/video.model';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { Profile } from '../models/profile.model';

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

  getFavoritedVideos(profileId: number): Video[] {
    const videos = this.videos.value;
    return videos.filter(video => video.favorited_by.some(profile => profile.id === profileId));
  }


  toggleFavorite(video: Video, profileId: number): void {
    const favoritedBy = new Set(video.favorited_by.map(p => p.id));
    if (favoritedBy.has(profileId)) {
      favoritedBy.delete(profileId);
    } else {
      favoritedBy.add(profileId);
    }

    const updatedFavoritedByIds = Array.from(favoritedBy);
    const updatedVideo: Partial<Video> = { favorited_by: updatedFavoritedByIds as any };

    this.apiService.updateVideo(video.id, updatedVideo).subscribe({
      next: (updatedVideo) => {
        const currentVideos = this.videos.value.map(v => 
          v.id === video.id ? { ...v, favorited_by: updatedVideo.favorited_by } : v
        );
        this.sortVideosById(currentVideos);
        this.videos.next(currentVideos);
      },
      error: (error) => {
        console.error('Failed to toggle favorite', error);
      }
    });
  }

  private sortVideosById(videos: Video[]): void {
    videos.sort((a, b) => a.id - b.id);
  }
}
