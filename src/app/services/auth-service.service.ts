import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CurrentUser, LoginRequest } from '../models/user.model';

/**
 * Session state. The JWT lives in HttpOnly cookies the browser cannot read,
 * so the logged-in account comes from GET /api/me/.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(private api: ApiService) { }

  loadCurrentUser(): Observable<CurrentUser> {
    const user = this.currentUser.value;
    if (user) {
      return of(user);
    }
    return this.api.getMe().pipe(tap(me => this.currentUser.next(me)));
  }

  login(data: LoginRequest): Observable<CurrentUser> {
    this.clearSession();
    return this.api.loginUser(data).pipe(switchMap(() => this.loadCurrentUser()));
  }

  /** Ends the session locally even if the server call fails (e.g. expired cookie). */
  logout(): Observable<void> {
    return this.api.logoutUser().pipe(
      catchError(() => of(undefined)),
      finalize(() => this.clearSession())
    );
  }

  clearSession(): void {
    this.currentUser.next(null);
  }
}
