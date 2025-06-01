import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingUsers, approveUser } from '../../services/auth.service';
import type { User, UserStatusType } from '../../types/auth.types';
import { UserStatus, UserRole } from '../../types/auth.types';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const UserApproval: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    // 관리자 권한 확인
    if (!user || user.role !== UserRole.ADMIN) {
      navigate('/dashboard');
      return;
    }

    // 승인 대기 중인 사용자 목록 로드
    fetchPendingUsers();
  }, [user, navigate]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (err: any) {
      setError('승인 대기 중인 사용자 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveUser({
        userId,
        status: UserStatus.ACTIVE,
        approvedBy: user?.id || ''
      });
      setActionSuccess('사용자가 성공적으로 승인되었습니다.');
      // 목록 새로고침
      fetchPendingUsers();
      // 3초 후 성공 메시지 숨김
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError('사용자 승인에 실패했습니다.');
      console.error(err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await approveUser({
        userId,
        status: UserStatus.REJECTED,
        approvedBy: user?.id || ''
      });
      setActionSuccess('사용자가 성공적으로 거부되었습니다.');
      // 목록 새로고침
      fetchPendingUsers();
      // 3초 후 성공 메시지 숨김
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError('사용자 거부에 실패했습니다.');
      console.error(err);
    }
  };

  // 상태에 따른 칩 색상 및 라벨 결정
  const getStatusChip = (status: UserStatusType) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Chip label="승인됨" color="success" size="small" />;
      case UserStatus.REJECTED:
        return <Chip label="거부됨" color="error" size="small" />;
      case UserStatus.PENDING:
      default:
        return <Chip label="대기 중" color="warning" size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container component="main" maxWidth="lg">
      <Paper
        elevation={3}
        sx={{
          marginTop: 4,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          사용자 승인 관리
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {actionSuccess && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {actionSuccess}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : pendingUsers.length === 0 ? (
          <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
            승인 대기 중인 사용자가 없습니다.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>아이디</TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{getStatusChip(user.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(user.id)}
                        sx={{ mr: 1 }}
                      >
                        승인
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(user.id)}
                      >
                        거부
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default UserApproval;
