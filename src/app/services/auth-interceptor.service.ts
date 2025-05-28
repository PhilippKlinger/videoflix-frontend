import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Token aus dem localStorage holen
    const token = localStorage.getItem('token');
    if (token) {
      // Request klonen und den Authorization-Header hinzufügen
      request = request.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      });
    }
    // debugger
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Intercepted Request:', request); // Log request details
        console.log('Error Status:', error.status); // Log error status
        console.log('Error Response:', error); // Log full error response
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          this.router.navigate(['/login']);
        }
        return error.status === 401 ? throwError(() => new Error('Unauthorized')) : throwError(() => error);
      })
    );
  }
}
