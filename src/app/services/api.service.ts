import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map, BehaviorSubject } from 'rxjs';
import { Profile } from '../models/profile.model';
import { Video } from '../models/video.model';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // public baseUrl = 'http://127.0.0.1:8000';
  public baseUrl = 'https://backend-videoflix.philipp-klinger.com';
  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public conversionProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  


  constructor(private http: HttpClient) { }

  //user model anlegen??
  registerUserEmail(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-email/`, data);
  }

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, data);
  }

  getNewActivationEmail(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-new-activation-link/`, data)
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from non_field_errors or default to a general error message
        const errorMsg = error.error.non_field_errors ? error.error.non_field_errors[0] : 'An unexpected error occurred';
        return throwError(() => errorMsg);
      })
    );
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/password-reset/`, data);
  }

  resetPasswordConfirm(code: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/password-reset-confirm/${code}/`, data);
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

  addVideo(videoData: FormData): Observable<Video | undefined> {
    return this.http.post<Video>(`${this.baseUrl}/upload/`, videoData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              this.uploadProgress.next(progress);
            }
            break;
          case HttpEventType.Response:
            return event.body as Video;
        }
        return undefined;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Video Upload failed', error);
        return throwError(() => new Error('Video Upload failed'));
      })
    );
  }

  updateVideo(videoId: number, videoData: Partial<Video>): Observable<Video> {
    return this.http.patch<Video>(`${this.baseUrl}/videos/${videoId}/`, videoData);
  }

  deleteVideo(videoId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/videos/${videoId}/`);
  }

  getConversionProgress(videoId: number): Observable<{ progress: number, current_resolution: string }> {
    return this.http.get<{ progress: number, current_resolution: string }>(`${this.baseUrl}/conversion-progress/${videoId}/`);
  }
  

  

  clearCache(): Observable<any> {
    return this.http.post(`${this.baseUrl}/clear-cache/`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Cache clear failed', error);
        return throwError(() => new Error('Cache clear failed'));
      })
    );
  }
}
