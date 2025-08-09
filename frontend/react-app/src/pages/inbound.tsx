import React, { useRef, useState, useEffect } from 'react';
import { ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css";
import "tabulator-tables/dist/css/tabulator.min.css";
import { DefaultButton } from '../components/button/defaultButton';
import { StockSearch } from '../components/StockSearch';
import './RecentStock.css';
import { inboundService } from '../services/inbound.service';

// Material Dashboard 2 React components
import MDBox from '../md-components/MDBox/index.jsx';
import MDButton from '../md-components/MDButton/index.jsx';
import MDTypography from '../md-components/MDTypography/index.jsx';
import { Card } from '@mui/material';
import BaseCodeSelectionModal from '../components/BaseCodeSelectionModal';


interface InboundItem {
  id?: string; // 고유 ID 추가
  stock_code: string;
  inbound_date: Date;
  quantity: number;
  unit: string;
  location: string;
  max_use_period: number;
  remark: string;
  lastUpdated: string;
  rowStatus?: string;
  delete?: string;
}

const Inbound: React.FC = () => {
  const tableRef = useRef<any>(null);

  const [tableData, setTableData] = useState<InboundItem[]>([
    {
      id: `row_${Date.now()}_0`, // 고유 ID 생성
      stock_code: "",
      inbound_date: new Date(),
      quantity: 0,
      unit: "",
      location: "",
      max_use_period: 0,
      remark: "",
      lastUpdated: new Date().toISOString(),
      rowStatus: "INSERT"
    }
  ]);

  const [filteredData, setFilteredData] = useState<InboundItem[]>(tableData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InboundItem | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  const [baseCodeModalOpen, setBaseCodeModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const handleDelete = (item: InboundItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedData = tableData.filter((item) => item.stock_code !== itemToDelete.stock_code);
      setTableData(updatedData);
      setFilteredData(updatedData);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  // 데이터 로딩
  useEffect(() => {
    const loadInbounds = async () => {
      try {
        const data = await inboundService.getAll();
        // 기존 데이터에 ID가 없으면 추가
        const dataWithIds = data.map((item: any, index: number) => ({
          ...item,
          id: item.id || `existing_${Date.now()}_${index}`
        }));
        setTableData(dataWithIds);
        setFilteredData(dataWithIds);
      } catch (error) {
        console.error('Error loading inbounds:', error);
        setNotification({
          open: true,
          message: '입고 데이터를 불러오는데 실패했습니다.',
          type: 'error'
        });
      }
    };

    loadInbounds();
  }, []);
  const handleSearch = (searchText: string, startDate?: string, endDate?: string) => {
    let filtered = [...tableData];
    
    if (searchText) {
      filtered = filtered.filter((item: InboundItem) => 
        item.stock_code.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((item: InboundItem) => {
        const itemDate = new Date(item.lastUpdated);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredData(filtered as InboundItem[]);
  };

  // 기초정보 선택 핸들러
  const handleStockCodeClick = (rowId: string) => {
    console.log("rowId", rowId);
    setSelectedRowId(rowId);
    setBaseCodeModalOpen(true);
  };

  // 기초정보 선택 완료 핸들러
  const handleBaseCodeSelect = (baseCode: any) => {
    console.log("baseCode", baseCode);
    console.log("selectedRowId", selectedRowId);
    
    if (selectedRowId !== null) {
      // 테이블 데이터를 ID로 찾아서 업데이트
      const updatedTableData = tableData.map(item => 
        item.id === selectedRowId 
          ? {
              ...item,
              stock_code: baseCode.code,
              unit: baseCode.unit,
              max_use_period: baseCode.max_use_period
            }
          : item
      );
      
      const updatedFilteredData = filteredData.map(item => 
        item.id === selectedRowId 
          ? {
              ...item,
              stock_code: baseCode.code,
              unit: baseCode.unit,
              max_use_period: baseCode.max_use_period
            }
          : item
      );
      
      // tabulator API를 사용해서 ID로 찾아서 업데이트
      if (tableRef.current && tableRef.current.table) {
        try {
          const tabulator = tableRef.current.table;
          const row = tabulator.getRow(selectedRowId);
          if (row) {
            row.update({
              stock_code: baseCode.code,
              unit: baseCode.unit,
              max_use_period: baseCode.max_use_period
            });
            console.log("Tabulator update successful");
          }
        } catch (error) {
          console.log("Tabulator update failed:", error);
        }
      }
      
      // React state 업데이트
      setTableData(updatedTableData);
      setFilteredData(updatedFilteredData);
    }
    
    setBaseCodeModalOpen(false);
    setSelectedRowId(null);
  };

  const columns: any = [
    {
      title: "재고코드",
      field: "stock_code",
      width: 150,
      editor: "input",
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        const rowData = row.getData();
        console.log("Clicked row data:", rowData);
        handleStockCodeClick(rowData.id);
      },
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        // INSERT 상태에서는 rowStatus를 변경하지 않음
        if (data.rowStatus === "INSERT") {
          console.log("INSERT 상태에서는 상태 변경하지 않음");
          return;
        }
        row.update({ rowStatus: "UPDATE" });
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      }
    },

    {
      title: "입고날짜",
      field: "inbound_date",
      width: 150,
      editor: "date",
      formatter: (cell: any) => {
        // Date 객체 → yyyy-MM-dd 형식으로 표시
        const value = cell.getValue();
        if (!(value instanceof Date)) return value;
        return value.toISOString().slice(0, 10); // yyyy-MM-dd
      },
      mutator: (value: any) => {
        // 문자열로 들어온 경우 Date 객체로 변환
        if (typeof value === "string") {
          return new Date(value);
        }
        return value;
      },
      // formatter: "date",
      // formatterParams: {
      //   inputFormat: "YYYY-MM-DD",
      //   outputFormat: "yyyy-MM-dd",
      //   invalidPlaceholder: "(Invalid Date)",
      //   locale: "ko"
      // },
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        // INSERT 상태에서는 rowStatus를 변경하지 않음
        if (data.rowStatus === "INSERT") {
          console.log("INSERT 상태에서는 상태 변경하지 않음");
          return;
        }
        row.update({ rowStatus: "UPDATE" });
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      }
    },
    {
      title: "입고수량",
      field: "quantity",
      width: 150,
      editor: "number",
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        // INSERT 상태에서는 rowStatus를 변경하지 않음
        if (data.rowStatus === "INSERT") {
          console.log("INSERT 상태에서는 상태 변경하지 않음");
          return;
        }
        row.update({ rowStatus: "UPDATE" });
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      }
    },
    {
      title: "단위",
      field: "unit",
      width: 100,
      editor: "input",
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        // INSERT 상태에서는 rowStatus를 변경하지 않음
        if (data.rowStatus === "INSERT") {
          console.log("INSERT 상태에서는 상태 변경하지 않음");
          return;
        }
        row.update({ rowStatus: "UPDATE" });
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      }
    },
    {
      title: "최초입고수량",
      field: "initialQuantity",
      width: 130,
      editor: "number",
      cellEdited: (cell: any) => {
      } },
    { title: "비고", field: "remark", width: 200, editor: "input",      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        // INSERT 상태에서는 rowStatus를 변경하지 않음
        if (data.rowStatus === "INSERT") {
          console.log("INSERT 상태에서는 상태 변경하지 않음");
          return;
        }
        row.update({ rowStatus: "UPDATE" });
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      } },
    { title: "최종수정일", field: "lastUpdated", width: 150 },
    { title: "상태", field: "rowStatus", width: 100 },
    {
      title: "삭제",
      field: "delete",
      hozAlign: "center",
      width: 60,
      formatter: () => "🗑",
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        if(row.getData().rowStatus === "INSERT") {
          row.delete();
          // setTableData((prev) => prev.filter((item) => item.id !== row.id));
        } else if(row.getData().rowStatus === "DELETE") {
          row.update({ rowStatus: "" });
          row.getElement().classList.remove("deleted-row");
          // setTableData((prev) => prev.filter((item) => item.id !== row.id));
        } else {
          row.update({ rowStatus: "DELETE" });
          row.getElement().classList.add("deleted-row");
          // setTableData((prev) => prev.map((item) => item.id === row.id ? { ...item, rowStatus: "DELETE" } : item));
        }
      }
    },
  ];

  const handleAddRow = () => {
    const newRow: InboundItem = {
      id: `row_${Date.now()}_${tableData.length}`, // 고유 ID 생성
      stock_code: "",
      inbound_date: new Date(),
      quantity: 0,
      unit: "",
      location: "",
      max_use_period: 0,
      remark: "",
      lastUpdated: new Date().toISOString(),
      rowStatus: "INSERT"
    };
    setTableData([...tableData, newRow]);
    setFilteredData([...filteredData, newRow]);
  };
  const handleInboundUpdate = async () => {
    try {
      const updatedData = tableData.filter(item => item.rowStatus !== "" && item.rowStatus !== undefined);
      
      // 여러 항목을 한 번에 저장
      await inboundService.saveStock(updatedData);
      
      // 성공적으로 저장된 후 상태 초기화
      setTableData(updatedData.map(item => ({
        ...item,
        rowStatus: undefined,
        delete: undefined
      })));
      setFilteredData(updatedData.map(item => ({
        ...item,
        rowStatus: undefined,
        delete: undefined
      })));
    } catch (error) {
      console.error('입고 저장 실패:', error);
      setNotification({
        open: true,
        message: '입고 데이터 저장에 실패했습니다.',
        type: 'error'
      });
    }
  };


  return (
    <MDBox py={3}>
      
      <Card sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <StockSearch onSearch={handleSearch} />
      </Card>

      <Card sx={{ p: 3, height: '68vh', backgroundColor: 'white' }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="medium">
            기초코드에 등록된 품목을 기준으로 입고품을 등록해주세요!
          </MDTypography>
          <MDBox display="flex" gap={2}>
            <MDButton variant="outlined" color="info" onClick={handleAddRow} sx={{ fontSize: 14, fontWeight: 600 }}>
              행 추가
            </MDButton>
            <MDButton 
              variant="gradient" 
              color="success"
              sx={{ fontSize: 14, fontWeight: 600 }}
              onClick={() => {
                const filteredDataToSave = tableData.filter(item => item.rowStatus !== "" && item.rowStatus !== undefined);
                const invalidItems = filteredDataToSave.filter(item => {
                  return !item.stock_code || item.stock_code.trim() === '' ||
                         typeof item.quantity !== 'number' || item.quantity < 0;
                });
                // if (invalidItems.length > 0) {
                //   alert('필수 필드가 누락되었거나 잘못된 값이 있습니다');
                //   return;
                // }
                inboundService.saveStock(filteredDataToSave);
              }}
            >
              입고 저장
            </MDButton>
          </MDBox>
        </MDBox>

        <MDBox sx={{ 
          flex: 1,
          overflow: 'hidden',
          '& .tabulator': {
            backgroundColor: 'white !important',
            border: '1px solid #eee',
            width: '100% !important',
            height: '100% !important',
            fontSize: { xs: '12px', sm: '13px', md: '14px' },
            overflow: 'auto',
          },
          '& .tabulator-tableholder': {
            overflow: 'auto !important',
            maxHeight: { xs: 'calåc(50vh - 120px)', sm: 'calc(55vh - 120px)', md: 'calc(65vh - 120px)' },
          },
          '& .tabulator-header': {
            backgroundColor: 'white !important',
            borderBottom: '1px solid #dee2e6',
          },
          '& .tabulator-col': {
            backgroundColor: 'white !important',
          },
          '& .tabulator-col-content': {
            backgroundColor: 'white !important',
          },
          '& .tabulator-cell': {
            backgroundColor: 'white !important',
            borderRight: '1px solid #dee2e6',
          },
          '& .tabulator-row': {
            backgroundColor: 'white !important',
          },
          '& .tabulator-row:hover': {
            backgroundColor: '#f5f5f5 !important',
          },
          '& .tabulator-row-even': {
            backgroundColor: 'white !important',
          },
          '& .tabulator-row-odd': {
            backgroundColor: 'white !important',
          },
          '& .deleted-row': {
            backgroundColor: '#ffebee !important',
            textDecoration: 'line-through',
            opacity: 0.6,
          }
        }}>
          <ReactTabulator
            ref={tableRef}
            data={filteredData}
            columns={columns}
            layout="fitDataStretch"
            options={{ 
              movableRows: true, 
              movableColumns: true,
              index: "id",
              height: "100%",
              layoutColumnsOnNewData: true,
              maxHeight: "100%",
              pagination: false,
              virtualDom: true,
              virtualDomBuffer: 50,
            }}
          />
        </MDBox>
      </Card>

      {/* 기초정보 선택 모달 */}
      <BaseCodeSelectionModal
        open={baseCodeModalOpen}
        onClose={() => setBaseCodeModalOpen(false)}
        onSelect={handleBaseCodeSelect}
      />
    </MDBox>
  );
};

export default Inbound;
