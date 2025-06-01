import api from './api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse,
  User, 
  ApproveUserRequest
} from '../types/auth.types';
import { UserStatus } from '../types/auth.types';

// 로그인 요청 함수
export const login = async (loginRequest: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', loginRequest);
  const data = response.data;
  
  // 성공일 때만 토큰과 사용자 정보 저장
  if (data.success && data.accessToken && data.user) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

// 회원가입 요청
export const register = async (registerData: RegisterRequest): Promise<User> => {
  const response = await api.post<User>('/auth/register', registerData);
  return response.data;
};

// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// 로그아웃
export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// 토큰 존재 여부 확인
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('accessToken') !== null;
};

// 대기 중인 사용자 목록 조회 (관리자용)
export const getPendingUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users/pending');
  return response.data;
};

// 사용자 승인/거부 (관리자용)
export const approveUser = async (approveData: ApproveUserRequest): Promise<User> => {
  const response = await api.post<User>('/users/approve', approveData);
  return response.data;
};

// 모든 사용자 목록 조회 (관리자용)
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};
