import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';
import { Video } from '../models/video.model';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  //user model anlegen??
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, data);
  }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseUrl}/profiles/`);
  }

  createProfile(profileData: Profile): Observable<Profile> {
    return this.http.post<Profile>(`${this.baseUrl}/profiles/`, profileData);
  }

  updateProfile(profileId: number, profileData: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.baseUrl}/profiles/${profileId}/`, profileData);
  }

  deleteProfile(profileId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profiles/${profileId}/`);
  }

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.baseUrl}/videos/`);
  }

  addVideo(videoData: Video): Observable<Video> {
    return this.http.post<Video>(`${this.baseUrl}/videos/`, videoData);
  }

  updateVideo(videoId: number, videoData: Video): Observable<Video> {
    return this.http.put<Video>(`${this.baseUrl}/videos/${videoId}/`, videoData);
  }

  deleteVideo(videoId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/videos/${videoId}/`);
  }
}
