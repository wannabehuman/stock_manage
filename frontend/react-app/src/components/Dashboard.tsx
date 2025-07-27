import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Card, 
  CardContent,
  CardActions,
  Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              대시보드
            </Typography>
            <Button variant="outlined" color="primary" onClick={handleLogout}>
              로그아웃
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              환영합니다, {user?.name || user?.username}님!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              역할: {user?.role === 'ADMIN' ? '관리자' : '일반 사용자'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    사용 기간 임박
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    사용 기간이 임박한 품목을 확인합니다.
                  </Typography>
                </CardContent>

              </Card>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    최근 출고 현황
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    출고 리스트
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">전체 출고 보기</Button>
                </CardActions>
              </Card>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    필요한 기능 접수
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    사용자가 요청한 기능 접수 현황
                  </Typography>
                </CardContent>
                <CardActions>
                  {user?.role === 'ADMIN' && (
                    <Button size="small" onClick={() => navigate('/admin/users')}>
                      승인 관리
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
