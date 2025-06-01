import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 로딩 중일 때는 아무것도 렌더링하지 않음
  if (loading) {
    return null;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 관리자 권한이 필요한 페이지에 일반 사용자가 접근하는 경우 대시보드로 리다이렉트
  if (requireAdmin && user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // 인증된 경우 중첩된 라우트를 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
