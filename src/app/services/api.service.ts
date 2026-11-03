import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map, BehaviorSubject } from 'rxjs';
import { Video } from '../models/video.model';
import { CurrentUser, LoginRequest, PasswordConfirmRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseUrl = environment.apiUrl;
  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public conversionProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) { }


  registerUser(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, data);
  }

  activateAccount(uid: string, token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/activate/${uid}/${token}/`);
  }

  getNewActivationEmail(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-new-activation-link/`, data)
  }

  loginUser(data: LoginRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/login/`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.error.non_field_errors ? error.error.non_field_errors[0] : 'An unexpected error occurred';
        return throwError(() => errorMsg);
      })
    );
  }

  logoutUser(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout/`, {});
  }

  getMe(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseUrl}/me/`);
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/password_reset/`, data);
  }

  resetPasswordConfirm(uid: string, token: string, data: PasswordConfirmRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/password_confirm/${uid}/${token}/`, data);
  }

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.baseUrl}/video/`);
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
    return this.http.patch<Video>(`${this.baseUrl}/video/${videoId}/`, videoData);
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
