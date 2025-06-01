import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { login as authLogin, register as authRegister, getCurrentUser, isAuthenticated as checkAuth, logout as authLogout } from '../services/auth.service';
import type { User } from '../types/auth.types';

// 컨텍스트 인터페이스 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, email: string) => Promise<void>;
  logout: () => void;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const initAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(checkAuth());
      setLoading(false);
    };

    initAuth();
  }, []);

  // 로그인 함수
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authLogin({ username, password });
      
      if (response.success) {
        // 로그인 성공 시 사용자 정보와 인증 상태 업데이트
        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      } else {
        // 로그인 실패 시 에러 메시지 설정
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err: any) {
      // 네트워크 오류 등 기타 예외 처리
      if (err.message) {
        setError(err.message);
      } else {
        setError(err.response?.data?.message || '로그인 중 오류가 발생했습니다.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (username: string, password: string, name: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authRegister({ username, password, name, email });
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅 - 인증 컨텍스트 사용
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
