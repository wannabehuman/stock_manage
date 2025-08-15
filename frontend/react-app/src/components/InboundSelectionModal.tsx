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
import { inboundService } from '../services/inbound.service';
import { baseCodeService } from '../services/baseCode.service';

interface InboundData {
  id?: number;
  stock_code: string;
  stock_name?: string; // 재고명 추가
  inbound_date: string | Date;
  quantity: number;
  unit: string;
  location: string;
  max_use_period: number;
  remark: string;
  lastUpdated?: string;
  rowStatus?: string;
}

interface InboundSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (inboundData: InboundData) => void;
}

const InboundSelectionModal: React.FC<InboundSelectionModalProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [inboundData, setInboundData] = useState<InboundData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadInboundData();
    }
  }, [open]);

  const loadInboundData = async () => {
    setLoading(true);
    try {
      // 입고 데이터와 기초코드 데이터를 동시에 가져오기
      const [inboundItems, baseCodeData] = await Promise.all([
        inboundService.getAll(),
        baseCodeService.getAll()
      ]);

      // 기초코드를 코드별로 매핑하여 빠른 검색을 위한 맵 생성
      const baseCodeMap = baseCodeData.reduce((map: any, baseCode: any) => {
        map[baseCode.code] = baseCode;
        return map;
      }, {});

      // 입고 데이터에 기초코드의 이름 추가
      const dataWithNames = inboundItems.map((item: any) => ({
        ...item,
        stock_name: baseCodeMap[item.stock_code]?.name || item.stock_code // 기초코드에서 이름 가져오기
      }));

      setInboundData(dataWithNames);
    } catch (error) {
      console.error('Error loading inbound data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'stock_code', headerName: '재고코드', width: 150, hide: true }, // 코드는 숨김
    { field: 'stock_name', headerName: '재고명', width: 200 }, // 재고명 추가
    { 
      field: 'inbound_date', 
      headerName: '입고날짜', 
      width: 150,
      valueFormatter: (params: any) => {
        if (params.value instanceof Date) {
          return params.value.toISOString().slice(0, 10);
        }
        return params.value;
      }
    },
    { field: 'quantity', headerName: '입고수량', width: 120 },
    { field: 'unit', headerName: '단위', width: 100 },
    { field: 'location', headerName: '위치', width: 120 },
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
      <DialogTitle>입고 데이터 선택</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%', mt: 2 }}>
          <DataGrid
            rows={inboundData}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id || row.stock_code || Math.random()}
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

export default InboundSelectionModal;