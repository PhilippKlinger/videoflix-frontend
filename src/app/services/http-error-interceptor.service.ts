import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorHandlingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // An ended session is handled by the AuthInterceptor (redirect), not shown as an error.
          if (error.status === 401) {
            return throwError(() => error);
          }
          let errorMessage = 'An unknown error occurred!';
          if (error.error instanceof ErrorEvent) {
            // Client-seitiger oder Netzwerkfehler
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
            // Der Backend kehrte einen erfolglosen Response-Code zurück.
            // Fehlermeldung aus dem Response ist, falls vorhanden, error.error.detail.
            errorMessage = error.error.detail || error.message || error.statusText;
          }
          this.errorService.log(errorMessage);
          return throwError(() => error);
        })
      );
  }
}
