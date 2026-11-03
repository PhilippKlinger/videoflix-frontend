import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ConversionProgress, Video } from '../models/video.model';
import { CurrentUser, LoginRequest, PasswordConfirmRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseUrl = environment.apiUrl;

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

  /** Starts a demo account; the backend sets the session cookies. */
  startDemo(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/demo/`, {});
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

  /** Upload with progress events; the caller reads the progress and the created video. */
  addVideo(videoData: FormData): Observable<HttpEvent<Video>> {
    return this.http.post<Video>(`${this.baseUrl}/upload/`, videoData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  updateVideo(videoId: number, videoData: Partial<Video>): Observable<Video> {
    return this.http.patch<Video>(`${this.baseUrl}/video/${videoId}/`, videoData);
  }

  deleteVideo(videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/video/${videoId}/`);
  }

  getConversionProgress(videoId: number): Observable<ConversionProgress> {
    return this.http.get<ConversionProgress>(`${this.baseUrl}/conversion-progress/${videoId}/`);
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
