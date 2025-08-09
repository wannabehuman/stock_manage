import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { UserRole } from '../types/auth.types';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToUserApproval = () => {
    navigate('/user-approval');
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        mt: { xs: 0, sm: 2, md: 3 },
        borderRadius: { xs: 0, sm: 2 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 3,
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            대시보드
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            로그아웃
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            환영합니다, {user?.name}님!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            역할: {user?.role === UserRole.ADMIN ? '관리자' : '일반 사용자'}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} lg={6} xl={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  사용자 정보
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">아이디: {user?.username}</Typography>
                  <Typography variant="body2">이메일: {user?.email}</Typography>
                  <Typography variant="body2">가입일: {new Date(user?.createdAt || '').toLocaleString()}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {user?.role === UserRole.ADMIN && (
            <Grid item xs={12} lg={6} xl={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    관리자 기능
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={navigateToUserApproval}
                      fullWidth
                    >
                      사용자 승인 관리
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} xl={user?.role === UserRole.ADMIN ? 4 : 8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  재고 관리 시스템
                </Typography>
                <Typography variant="body2">
                  이 대시보드에서 재고 관리 기능을 이용할 수 있습니다. 
                  왼쪽 메뉴에서 원하는 기능을 선택하세요.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
