// For backend operations (login/register)
export interface UserCredentials {
  username: string;
  password: string;
  email?: string;
}

// For frontend user data (without password)
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// For backend response/requests that include password
export interface UserWithPassword extends User {
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  access_token: string;
  token_type: string;
}
