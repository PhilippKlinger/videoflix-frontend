import { Injectable } from '@angular/core';
import { HttpContextToken, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

/** Set on requests whose component shows its own friendly error message. */
export const SHOWS_OWN_ERRORS = new HttpContextToken<boolean>(() => false);

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
          let errorMessage = 'An unknown error occurred!';
          if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            errorMessage = `An error occurred: ${error.error.message}`;
          } else if (error.error.non_field_errors) {
            errorMessage = error.error.non_field_errors[0];
          } else if (error.error.email) {
            errorMessage = error.error.email[0];
          }
          else if (error.status === 403 && error.error.detail?.startsWith('CSRF Failed')) {
            // Missing or stale CSRF cookie: a reload fetches a new one.
            errorMessage = 'Your session could not be verified. Please reload the page and try again.';
          }
          else {
            // The backend returned an unsuccessful response code.
            // The error message is in error.error.detail, if present.
            errorMessage = error.error.detail || error.message || error.statusText;
          }
          this.errorService.log(errorMessage);
          return throwError(() => error);
        })
      );
  }
}
