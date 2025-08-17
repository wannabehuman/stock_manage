import React, { useState, useEffect } from 'react';
import '../styles/BaseCodeManagement.css';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { baseCodeService } from '../services/baseCode.service';
import MDBox from '../md-components/MDBox/index.jsx';
import MDButton from '../md-components/MDButton/index.jsx';
import MDTypography from '../md-components/MDTypography/index.jsx';
import { Card } from '@mui/material';

// 기준정보(코드) 타입 정의
interface BaseCode {
  id?: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  max_use_period: number;
  isAlert: boolean;
  isActive: boolean;
  sortOrder: number;
  remark: string;
  description?: string;
}

// 임시 데이터
const initialBaseCodes: BaseCode[] = [
  {
    code: 'RAW_MATERIAL',
    name: '원자재',
    category: 'ITEM_TYPE',
    unit: '개',
    max_use_period: 0,

    description: '',
    isAlert: false,
    isActive: true,
    sortOrder: 1,
    remark: '제품 생산에 사용되는 원자재'
  },
  {
    code: 'AUX_MATERIAL',
    name: '부자재',
    category: 'ITEM_TYPE',
    unit: '개',
    max_use_period: 0,

    description: '',
    isAlert: false,
    isActive: true,
    sortOrder: 2,
    remark: '제품 생산에 보조적으로 사용되는 부자재'
  },
  {
    code: 'QUANTITY',
    name: '수량관리',
    category: 'MNGMT_TYPE',
    unit: '개',
    max_use_period: 0,
    description: '',
    isAlert: false,
    isActive: true,
    sortOrder: 1,
    remark: '수량으로 관리하는 품목',
  }
];

// 카테고리 타입
const categoryOptions = [
  { value: 'GONGINDAN', label: '공진단' },
  { value: 'GYEONGOKGO', label: '경옥고' },
  { value: 'DIET', label: '다이어트' },
  { value: 'MEDICINE', label: '상비약' },
  { value: 'LIFE', label: '생활한약' },
  { value: 'ETC', label: '기타' }
];

const BaseCodeManagement: React.FC = () => {
  const [baseCodes, setBaseCodes] = useState<BaseCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<BaseCode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ open: false, message: '', type: 'success' });
  const [editCodeData, setEditCodeData] = useState<BaseCode | null>(null);

  // 입력 필드 상태
  const [codeInput, setCodeInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [unitInput, setUnitInput] = useState<string>('');
  const [max_use_periodInput, setmax_use_periodInput] = useState<number>(0);
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [remarkInput, setRemarkInput] = useState<string>('');
  const [isAlertInput, setIsAlertInput] = useState<boolean>(false);
  const [isActiveInput, setIsActiveInput] = useState<boolean>(true);
  const [sortOrderInput, setSortOrderInput] = useState<number>(0);

  // 데이터 로딩
  useEffect(() => {
    const loadBaseCodes = async () => {
      try {
        const data = await baseCodeService.getAll();
        setBaseCodes(data);
        setFilteredCodes(data);
      } catch (error) {
        console.error('Error loading base codes:', error);
        setNotification({
          open: true,
          message: '기준코드 데이터를 불러오는데 실패했습니다.',
          type: 'error'
        });
      }
    };

    loadBaseCodes();
  }, []);

  // 카테고리 별 필터링
  useEffect(() => {
    if (selectedCategory) {
      setFilteredCodes(baseCodes.filter(code => code.category === selectedCategory));
    } else {
      setFilteredCodes(baseCodes);
    }
  }, [baseCodes, selectedCategory]);
  
  // DataGrid 열 정의
  const columns = [
    { field: 'code', headerName: '코드', width: 150 },
    { field: 'name', headerName: '이름', width: 150 },
    { field: 'category', headerName: '카테고리', width: 150 },
    { field: 'unit', headerName: '단위', width: 100 },
    { field: 'max_use_period', headerName: '최대사용기간', width: 150 },
    { field: 'remark', headerName: '비고', width: 500 },
    { 
      field: 'isAlert', 
      headerName: '알림', 
      width: 100,
      renderCell: (params: any) => {
        return params.value ? (
          <span style={{ color: 'green' }}>✔️ 사용</span>
        ) : (
          <span style={{ color: 'red' }}>❌ 미사용</span>
        );
      }
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        return (
          <>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mr: 1, fontSize: '0.7rem', py: 0.3, px: 0.5, minWidth: 'auto' }}
              onClick={() => handleEdit(params.row.code)}
              >
              수정
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ fontSize: '0.7rem', py: 0.3, px: 0.5, minWidth: 'auto' }}
              onClick={() => handleDelete(params.row.code)}
              >
              🗑
            </Button>
          </>
        );
      }
    }
  ];
  
  // 삭제 처리
  const handleDelete = async (codeId: string) => {
    try {
      // 실제 API 호출 필요
      await baseCodeService.delete(codeId);
      
      // 성공 시 데이터 업데이트
      const updatedCodes = filteredCodes.filter(code => code.code !== codeId);
      setFilteredCodes(updatedCodes);
      setNotification({
        open: true,
        message: '기준코드가 삭제되었습니다.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting base code:', error);
      setNotification({
        open: true,
        message: '기준코드 삭제에 실패했습니다.',
        type: 'error'
      });
    }
  };
  
  // 수정 처리
  const handleEdit = (codeId: string) => {
    console.log(codeId);
    const codeToEdit = filteredCodes.find(code => code.code === codeId);
    if (codeToEdit) {
      setEditCodeData(codeToEdit);
      setCodeInput(codeToEdit.code);
      setNameInput(codeToEdit.name);
      setCategoryInput(codeToEdit.category);
      setUnitInput(codeToEdit.unit);

      setmax_use_periodInput(codeToEdit.max_use_period);
      setRemarkInput(codeToEdit.remark);
      setIsAlertInput(codeToEdit.isAlert);
      setIsActiveInput(codeToEdit.isActive);
      setIsEditDialogOpen(true);
    }
  };
  
  // 추가 처리
  const handleAdd = () => {
    // 입력 필드 초기화
    setCodeInput('');
    setNameInput('');
    setCategoryInput(selectedCategory || '');

    setUnitInput('');

    setmax_use_periodInput(0);
    setRemarkInput('');
    setIsAlertInput(false);
    setIsActiveInput(true);
    // setSortOrderInput(baseCodes.length + 1);
    setIsAddDialogOpen(true);
  };
  
  // 저장 처리
  const handleSave = async () => {
    try {
      if (isEditDialogOpen) {
        // 수정 로직
        if (!editCodeData) {
          setNotification({
            open: true,
            message: '수정할 기준코드를 선택해주세요.',
            type: 'error'
          });
          return;
        }

        const updatedCode = {
          code: codeInput || editCodeData.code,
          name: nameInput || editCodeData.name,
          category: categoryInput || editCodeData.category,
          unit: unitInput || editCodeData.unit,
          max_use_period: max_use_periodInput || editCodeData.max_use_period,
          isAlert: isAlertInput || editCodeData.isAlert,
          isActive: isActiveInput || editCodeData.isActive,
          sortOrder: sortOrderInput || editCodeData.sortOrder,
          remark: remarkInput || editCodeData.remark,
          description: descriptionInput || editCodeData.description
        };

        await baseCodeService.update(updatedCode.code, updatedCode);
        const updatedCodes = baseCodes.map(code => 
          code.code === editCodeData.code ? { ...code, ...updatedCode } : code
        );
        setBaseCodes(updatedCodes);
        setNotification({
          open: true,
          message: '기준코드가 수정되었습니다.',
          type: 'success'
        });
      }else{
        await baseCodeService.create({
          code: codeInput,
          name: nameInput,
          category: categoryInput,
          unit: unitInput,
          max_use_period: max_use_periodInput,
          isAlert: isAlertInput,
          isActive: isActiveInput,
          remark: remarkInput,
        });
        setNotification({
          open: true,
          message: '기준코드가 추가되었습니다.',
          type: 'success'
        });
        await baseCodeService.getAll();
        setBaseCodes(await baseCodeService.getAll());
      }
    } catch (error) {
      console.error('Error saving base code:', error);
      setNotification({
        open: true,
        message: '기준코드 저장에 실패했습니다.',
        type: 'error'
      });
    } finally {
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    }
  };
  
  // 알림 닫기
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <MDBox py={3} sx={{ 
      minWidth: '1200px',
      overflowX: 'auto',
      '& *': { 
        color: '#000000 !important' 
      },
      '& .MuiButton-root': {
        color: 'white !important'
      },
      '& .MuiButton-outlined': {
        color: '#1976d2 !important'
      },
      '& .MuiButton-outlinedError': {
        color: '#d32f2f !important'
      }
    }}>
      <Card sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <MDBox display="flex" gap={2} alignItems="center">
          <TextField
            select
            label="카테고리 선택"
            defaultValue= ''
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="medium"
            sx={{ 
              minWidth: 250,
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center'
              },
              '& .MuiInputBase-root': {
                height: '44px !important', // 다른 컴포넌트와 동일한 높이
              },
              '& .MuiOutlinedInput-input': {
                // padding: '16.5px 14px', // 표준 TextField 패딩
              }
            }}
          >
            <MenuItem value="">
              <em>전체 카테고리</em>
            </MenuItem>
            {categoryOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={{
                  whiteSpace: 'normal'
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <MDButton variant="gradient" color="info" onClick={() => setSelectedCategory('')}>
            전체 보기
          </MDButton>
        </MDBox>
      </Card>

      <Card sx={{ 
        p: 3, 
        height: '68vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="medium">
            기준코드 관리
          </MDTypography>
          <MDBox display="flex" gap={2}>
            <MDButton
              variant="gradient"
              color="success"
              onClick={handleAdd}
            >
              ➕ 새 코드 추가
            </MDButton>
          </MDBox>
        </MDBox>
        <MDBox sx={{ 
          flex: 1,
          overflow: 'auto',
          minHeight: 300,
          minWidth: '1200px',
          '& .MuiDataGrid-root': {
            border: '1px solid #eee',
            fontSize: '0.875rem',
            backgroundColor: 'white !important',
            minWidth: '1200px'
          },
          '& .MuiDataGrid-cell': {
            outline: 'none !important', // 포커스 아웃라인 제거
            backgroundColor: 'white !important'
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white !important'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f5f5f5 !important'
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'white !important',
            borderBottom: '1px solid #eee'
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'white !important'
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: 'white !important'
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: 'white !important'
          }
        }}>
          <DataGrid
            rows={filteredCodes}
            columns={columns}
            density="compact"
            getRowId={(row) => row.code}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 20]}
            disableRowSelectionOnClick
            // 2. 로딩 상태 추가 (데이터 없을 때)
            loading={filteredCodes.length === 0}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography color="textSecondary">
                    {selectedCategory 
                      ? `'${categoryOptions.find(c => c.value === selectedCategory)?.label}' 카테고리에 데이터가 없습니다`
                      : '기준코드 데이터가 없습니다'}
                  </Typography>
                </Box>
              )
            }}
          />
        </MDBox>
      </Card>

      {/* 기준정보 추가/수정 다이얼로그 */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onClose={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 0,
            '& *': { 
              color: '#000000 !important' 
            },
            '& .MuiButton-root': {
              color: 'white !important'
            },
            '& .MuiButton-outlined': {
              color: '#1976d2 !important'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #dee2e6',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}>
          {isEditDialogOpen ? '기준정보 수정' : '기준정보 추가'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="코드"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                required
                error={!codeInput}
                helperText={!codeInput ? '코드를 입력하세요' : ''}
                sx={{ flex: 1 }}
                size="medium"
              />
              <TextField
                label="이름"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                error={!nameInput}
                helperText={!nameInput ? '이름을 입력하세요' : ''}
                sx={{ flex: 1 }}
                size="medium"
              />
            </Box>
            
            <TextField
              select
              label="카테고리"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              fullWidth
              required
              error={!categoryInput}
              helperText={!categoryInput ? '카테고리를 선택하세요' : ''}
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  height: '44px !important'
                }
              }}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="단위"
                value={unitInput}
                onChange={(e) => setUnitInput(e.target.value)}
                sx={{ flex: 1 }}
                size="medium"
              />
              <TextField
                label="사용기간(일)"
                type="number"
                value={max_use_periodInput}
                onChange={(e) => setmax_use_periodInput(parseInt(e.target.value) || 0)}
                sx={{ flex: 1 }}
                size="medium"
              />
              <TextField
                select
                label="사용여부"
                value={isActiveInput ? "true" : "false"}
                onChange={(e) => setIsActiveInput(e.target.value === "true")}
                sx={{ 
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '44px !important'
                  }
                }}
                size="medium"
              >
                <MenuItem value="true">사용</MenuItem>
                <MenuItem value="false">미사용</MenuItem>
              </TextField>
            </Box>
            
            <TextField
              label="설명 및 비고"
              value={remarkInput || ''}
              onChange={(e) => setRemarkInput(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="상품에 대한 설명이나 비고사항을 입력하세요"
              size="medium"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button 
            onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}
            variant="outlined"
            sx={{ minWidth: 80 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>



      {/* 알림 메시지 */}
      {notification && (
        
        <Snackbar
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification?.type} sx={{ width: '100%' }}>
            {notification?.message}
          </Alert>
        </Snackbar>
      )}
    </MDBox>
  );
};

export default BaseCodeManagement;
