import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { baseCodeService } from '../services/baseCode.service';

interface BaseCode {
  code: string;
  name: string;
  category: string;
  unit: string;
  max_use_period: number;
  remark: string;
}

interface BaseCodeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (baseCode: BaseCode) => void;
}

const BaseCodeSelectionModal: React.FC<BaseCodeSelectionModalProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [baseCodes, setBaseCodes] = useState<BaseCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadBaseCodes();
    }
  }, [open]);

  const loadBaseCodes = async () => {
    setLoading(true);
    try {
      const data = await baseCodeService.getAll();
      setBaseCodes(data);
    } catch (error) {
      console.error('Error loading base codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'code', headerName: '재고코드', width: 150 },
    { field: 'name', headerName: '품목명', width: 200 },
    { field: 'category', headerName: '카테고리', width: 150 },
    { field: 'unit', headerName: '단위', width: 100 },
    { field: 'max_use_period', headerName: '사용기간', width: 120 },
    { field: 'remark', headerName: '비고', width: 200, flex: 1 },
    {
      field: 'actions',
      headerName: '선택',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => onSelect(params.row)}
        >
          선택
        </Button>
      )
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>기초정보 선택</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%', mt: 2 }}>
          <DataGrid
            rows={baseCodes}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.code}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 20]}
            disableRowSelectionOnClick
            onRowDoubleClick={(params) => onSelect(params.row)}
            sx={{
              '& .MuiDataGrid-root': {
                backgroundColor: 'white'
              },
              '& .MuiDataGrid-cell': {
                backgroundColor: 'white'
              }
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          * 행을 더블클릭하거나 선택 버튼을 눌러서 선택할 수 있습니다.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BaseCodeSelectionModal;