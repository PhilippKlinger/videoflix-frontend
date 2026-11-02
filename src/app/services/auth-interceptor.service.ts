import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, shareReplay, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth-service.service';
import { environment } from '../environments/environment';

/**
 * The access cookie expires after 25 minutes. On a 401 this interceptor asks the
 * backend once for a new one (refresh cookie) and repeats the request.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private refreshUrl = `${environment.apiUrl}/token/refresh/`;
  private noRefreshUrls = [`${environment.apiUrl}/login/`, this.refreshUrl];
  // Shared by all requests that fail while one refresh is running.
  private refreshInProgress: Observable<HttpEvent<unknown>> | null = null;

  constructor(private router: Router, private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || this.noRefreshUrls.includes(request.url)) {
          return throwError(() => error);
        }
        return this.refresh(next).pipe(
          catchError(() => {
            this.authService.clearSession();
            this.router.navigate(['/']);
            return throwError(() => error);
          }),
          switchMap(() => next.handle(request))
        );
      })
    );
  }

  private refresh(next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.refreshInProgress) {
      this.refreshInProgress = next.handle(new HttpRequest('POST', this.refreshUrl, {})).pipe(
        filter(event => event.type === HttpEventType.Response),
        finalize(() => this.refreshInProgress = null),
        shareReplay(1)
      );
    }
    return this.refreshInProgress;
  }
}
