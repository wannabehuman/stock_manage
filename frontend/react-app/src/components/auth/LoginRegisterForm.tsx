import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress, 
  Snackbar 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginRegisterForm: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (isLoginView) {
        // 로그인 로직
        await login(formData.username, formData.password);
        setSuccess('로그인에 성공했습니다!');
        
        // 로그인 성공 후 원래 가려던 페이지 또는 대시보드로 이동
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        // 회원가입 로직
        if (formData.password !== formData.confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        
        await register(formData.username, formData.password, formData.name, formData.email);
        setSuccess('회원가입 요청이 완료되었습니다. 관리자 승인 후 로그인하실 수 있습니다.');
        
        // 회원가입 성공 후 로그인 화면으로 전환
        setTimeout(() => {
          setIsLoginView(true);
          setFormData(prev => ({
            ...prev, 
            password: '',
            confirmPassword: '',
            name: '',
            email: ''
          }));
        }, 3000);
      }
    } catch (err: any) {
      console.error('오류 발생:', err);
      setError(err.response?.data?.message || err.message || '서버 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* 오류 메시지 */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* 성공 메시지 */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
      
      <Paper 
        elevation={3} 
        sx={{ 
          padding: { xs: 3, sm: 4 },
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          width: '100%',
          maxWidth: { xs: '350px', sm: '400px' },
          borderRadius: 2
        }}
      >
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <Typography component="h1" variant="h5" gutterBottom>
          {isLoginView ? '로그인' : '회원가입'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {isLoginView ? (
            // 로그인 폼
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="아이디"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                로그인
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  계정이 없으신가요? 
                  <Button color="primary" onClick={toggleView} sx={{ ml: 1 }}>
                    회원가입
                  </Button>
                </Typography>
              </Box>
            </>
          ) : (
            // 회원가입 폼
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="아이디"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      label="이름"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="이메일"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </Box>
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="비밀번호"
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </Box>
                <Box>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="비밀번호 확인"
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </Box>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                회원가입
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  이미 계정이 있으신가요?
                  <Button color="primary" onClick={toggleView} sx={{ ml: 1 }}>
                    로그인
                  </Button>
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginRegisterForm;
