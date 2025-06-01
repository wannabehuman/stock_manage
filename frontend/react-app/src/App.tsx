import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import { UserRole } from './types/auth.types';
import type { UserRoleType } from './types/auth.types';
import MainLayout from './components/layout/MainLayout';
import './App.css';

// LoginRegisterForm 컴포넌트 임포트
import LoginRegisterForm from './components/auth/LoginRegisterForm.tsx';
import UserApproval from './components/auth/UserApproval.tsx';

// Dashboard 컴포넌트 임포트
import Dashboard from './components/Dashboard.tsx';

// 권한 기반 접근 제어를 위한 ProtectedRoute 컴포넌트
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleType[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 인증 로딩 중 표시
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 인증되지 않은 사용자 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 권한 체크
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <Router>
          <Routes>
          {/* 로그인 및 회원가입 페이지 */}
          <Route path="/login" element={<LoginRegisterForm />} />
          
          {/* 메인 대시보드 - 로그인 필요 */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* 사용자 승인 페이지 - 관리자만 접근 가능 */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <MainLayout>
                <UserApproval />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* 기본 경로는 대시보드로 리디렉션 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 페이지 */}
          <Route path="*" element={
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <h1>404 - 페이지를 찾을 수 없습니다</h1>
              <p>요청하신 페이지를 찾을 수 없습니다.</p>
            </Box>
          } />
        </Routes>
        </Router>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;
