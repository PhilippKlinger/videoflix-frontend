export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmed_password: string;
}

export interface PasswordConfirmRequest {
  new_password: string;
  confirm_password: string;
}

export type Role = 'admin' | 'member' | 'demo';

/** Logged-in account as returned by GET /api/me/. */
export interface CurrentUser {
  id: number;
  email: string;
  role: Role;
}
