export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  token?: string;
}
