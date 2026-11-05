import { Injectable } from '@angular/core';
import { HttpContextToken, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

/** Set on requests whose component shows its own friendly error message. */
export const SHOWS_OWN_ERRORS = new HttpContextToken<boolean>(() => false);

export const FRIENDLY_ERROR = 'Something went wrong. Please try again later.';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorHandlingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // An ended session is handled by the AuthInterceptor (redirect), not shown as an error;
          // components that show their own message must not get a second one later.
          if (error.status === 401) {
            return throwError(() => error);
          }
          if (request.context.get(SHOWS_OWN_ERRORS)) {
            // The user sees the component's friendly text; the details stay in the console.
            console.error('HTTP error', request.method, request.url, error.status, error.error);
            return throwError(() => error);
          }
          let errorMessage = FRIENDLY_ERROR;
          const body = error.error;
          if (body?.non_field_errors) {
            errorMessage = body.non_field_errors[0];
          } else if (body?.email) {
            errorMessage = body.email[0];
          } else if (error.status === 403 && body?.detail?.startsWith('CSRF Failed')) {
            // Missing or stale CSRF cookie: a reload fetches a new one.
            errorMessage = 'Your session could not be verified. Please reload the page and try again.';
          } else if (error.status >= 400 && error.status < 500 && body?.detail) {
            errorMessage = body.detail;
          } else {
            // Network and server errors: friendly text for the user, details in the console.
            console.error('HTTP error', request.method, request.url, error.status, body);
          }
          this.errorService.log(errorMessage);
          return throwError(() => error);
        })
      );
  }
}
