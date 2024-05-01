import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

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

    return next.handle(request).pipe(
      catchError(error => {
        // Bei einem 401-Fehler (Unauthorized) Benutzer zur Login-Seite leiten
        if (error.status === 401) {
          localStorage.removeItem('token'); // Token entfernen, falls ungültig oder abgelaufen
          this.router.navigateByUrl('/login');
        }
        return throwError(() => new Error(error));
      })
    );
  }
}
