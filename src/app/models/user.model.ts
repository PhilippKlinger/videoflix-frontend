export interface User {
  email: string;
  username: string;
  password: string;
  password_confirm?: string;
  is_active?: boolean;
  activation_code?: string;
}
