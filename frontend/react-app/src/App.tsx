import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, ThemeProvider } from '@mui/material';
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';

// Material Dashboard 2 React themes
import theme from "./assets/theme";
import { UserRole } from './types/auth.types';
import type { UserRoleType } from './types/auth.types';

import MDBox from "./md-components/MDBox/index.jsx";
import { MaterialUIControllerProvider, useMaterialUIController, setMiniSidenav } from "./md-context/index.jsx";

// Material Dashboard 2 React example components
import Sidenav from "./examples/Sidenav/index.jsx";
import DashboardLayout from "./examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "./examples/Navbars/DashboardNavbar/index.jsx";

// Images
import brandWhite from "./assets/images/logo-ct.png";
import brandDark from "./assets/images/logo-ct-dark.png";

// Routes
import routes from "./routes";

import './App.css';

import LoginRegisterForm from './components/auth/LoginRegisterForm.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleType[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // 동적 라우트 생성 함수
  const getRoutes = (allRoutes: any[]) =>
    allRoutes.map((route: any) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        const Component = route.component;
        return (
          <Route 
            path={route.route} 
            element={
              <ProtectedRoute allowedRoles={route.key === "user-approval" ? [UserRole.ADMIN] : undefined}>
                <DashboardLayout>
                  <DashboardNavbar />
                  <Component />
                </DashboardLayout>
              </ProtectedRoute>
            } 
            key={route.key} 
          />
        );
      }

      return null;
    });

  return (
    <>
      <CssBaseline />
      <AuthProvider>
        <MenuProvider>
          <Router>
            {layout === "dashboard" && (
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="재고 관리 시스템"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
            )}
            <Routes>
              {/* 로그인 페이지는 별도 레이아웃 */}
              <Route path="/login" element={<LoginRegisterForm />} />
              
              {/* 동적 라우트 생성 */}
              {getRoutes(routes)}
              
              {/* 기본 경로는 대시보드로 리디렉션 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 페이지 */}
              <Route path="*" element={
                <DashboardLayout>
                  <MDBox sx={{ p: 3, textAlign: 'center' }}>
                    <h1>404 - 페이지를 찾을 수 없습니다</h1>
                    <p>요청하신 페이지를 찾을 수 없습니다.</p>
                  </MDBox>
                </DashboardLayout>
              } />
            </Routes>
          </Router>
        </MenuProvider>
      </AuthProvider>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MaterialUIControllerProvider>
        <AppContent />
      </MaterialUIControllerProvider>
    </ThemeProvider>
  );
}

export default App;