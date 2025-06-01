// 사용자 상태 타입 정의
export const UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED'
} as const;
export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];

// 사용자 역할 타입 정의
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;
export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// 사용자 인터페이스 정의
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  createdAt: string;
  updatedAt: string;
}

// 로그인 요청 인터페이스
export interface LoginRequest {
  username: string;
  password: string;
}

// 회원가입 요청 인터페이스
export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
}

// 인증 응답 인터페이스
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// 로그인 응답 인터페이스 (백엔드 응답 형식 변경에 따른 새로운 형식)
export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
}

// 사용자 승인 요청 인터페이스
export interface ApproveUserRequest {
  userId: string;
  status: UserStatusType;
  approvedBy: string;
}

// 모듈 타입 문제 해결을 위한 빈 export
export {};
