// http-error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorHandlingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An unknown error occurred!';
          if (error.error instanceof ErrorEvent) {
            // Client-seitiger oder Netzwerkfehler
            errorMessage = `An error occurred: ${error.error.message}`;
          } else if (error.error.non_field_errors) {
            errorMessage = error.error.non_field_errors[0];
          }else if (error.error.email) {
            errorMessage = error.error.email[0];
          }
          else {
            // Der Backend kehrte einen erfolglosen Response-Code zurück.
            // Fehlermeldung aus dem Response ist, falls vorhanden, error.error.detail.
            errorMessage = error.error.detail || error.message;
          }
          this.errorService.log(errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
