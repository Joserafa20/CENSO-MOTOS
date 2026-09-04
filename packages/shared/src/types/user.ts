import { UUID, Email, PhoneNumber, UserRole, ApiResponse, PaginatedResponse } from './common';

export interface User {
  id: UUID;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: PhoneNumber;
  documentNumber: string;
  documentType: 'CC' | 'CE' | 'PA' | 'TI';
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  documentNumber: string;
  documentType: 'CC' | 'CE' | 'PA' | 'TI';
  role: UserRole;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: UUID;
  email: Email;
  firstName: string;
  lastName: string;
  phoneNumber?: PhoneNumber;
  documentNumber: string;
  documentType: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends CreateUserDTO {}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  sub: UUID;
  email: Email;
  role: UserRole;
  iat: number;
  exp: number;
}

export type UserListResponse = ApiResponse<PaginatedResponse<UserResponse>>;
export type UserSingleResponse = ApiResponse<UserResponse>;
export type AuthResponse = ApiResponse<AuthTokens>;