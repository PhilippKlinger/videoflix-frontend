import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private userIdKey = 'userId';
  private usernameKey = 'auth-user';

  setAuthCredentials(token: string, userId: string, username: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userIdKey, userId);
    localStorage.setItem(this.usernameKey, username);
  }

  removeAuthCredentials(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.usernameKey);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}
