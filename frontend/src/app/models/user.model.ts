export interface User {
  id?: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDTO {
  id?: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRequest {
  username: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export enum UserRole {
  BASIC_USER = 'BASIC_USER',
  ADMIN = 'ADMIN'
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}