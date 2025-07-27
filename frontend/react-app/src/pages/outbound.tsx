import React, { useRef, useState, useEffect } from 'react';
import { ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css";
import "tabulator-tables/dist/css/tabulator.min.css";
import { DefaultButton } from '../components/button/defaultButton';
import { StockSearch } from '../components/StockSearch';
import { outboundService } from '../services/outbound.service';
import { inboundService } from '../services/inbound.service';
import './RecentStock.css';
import InboundSelectionModal from '../components/InboundSelectionModal';

// Material Dashboard 2 React components
import MDBox from '../md-components/MDBox/index.jsx';
import MDButton from '../md-components/MDButton/index.jsx';
import MDTypography from '../md-components/MDTypography/index.jsx';
import { Card } from '@mui/material';

interface OutboundItem {
  id?: string; // 고유 ID 추가
  inboundId?: string; // 입고 재고코드로 변경
  inbound_date?: string;
  inboundQuantity?: number;
  outboundDate: string;
  outboundQuantity: number;
  unit?: string;
  remark?: string;
  status?: string; // PENDING, COMPLETED
  rowStatus?: string;
}

const Outbound: React.FC = () => {
  const tableRef = useRef<any>(null);
  const [tableData, setTableData] = useState<OutboundItem[]>([
    {
      id: `row_${Date.now()}_0`, // 초기 행에 고유 ID
      inboundId: "",
      inbound_date: "",
      inboundQuantity: 0,
      outboundDate: new Date().toISOString().split('T')[0],
      outboundQuantity: 0,
      unit: "",
      remark: "",
      status: "PENDING",
      rowStatus: "INSERT"
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [inboundModalOpen, setInboundModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  useEffect(() => {
    loadOutboundData();
  }, []);

  const loadOutboundData = async () => {
    try {
      const outboundItems = await outboundService.getAll();
      console.log("Loaded outbound data:", outboundItems);
      
      // 기존 데이터에 ID가 없으면 추가하고, 서버 데이터 구조에 맞게 변환
      const dataWithIds = outboundItems.map((item: any, index: number) => ({
        id: item.id ? item.id.toString() : `existing_${Date.now()}_${index}`,
        inboundId: item.stock_code || "", // stock_code를 inboundId로 매핑
        stock_code: item.stock_code || "",
        inbound_date: item.inbound_date || "",
        inboundQuantity: 0, // 서버에서 제공하지 않으므로 기본값
        outboundDate: typeof item.outboundDate === 'object' 
          ? item.outboundDate.toISOString().slice(0, 10) 
          : item.outboundDate || new Date().toISOString().split('T')[0],
        outboundQuantity: item.quantity || 0,
        quantity: item.quantity || 0,
        unit: item.unit || "",
        remark: item.remark || "",
        status: item.status || "PENDING",
        rowStatus: ""
      }));
      
      setTableData(dataWithIds);
    } catch (error) {
      console.error('Error loading outbound data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 입고데이터 선택 핸들러 (재고코드 셀 클릭)
  const handleInboundIdClick = (rowId: string) => {
    console.log("rowId", rowId);
    setSelectedRowId(rowId);
    setInboundModalOpen(true);
  };

  // 입고데이터 선택 완료 핸들러
  const handleInboundSelect = (inboundData: any) => {
    console.log("inboundData", inboundData);
    console.log("selectedRowId", selectedRowId);
    
    if (selectedRowId !== null) {
      // 테이블 데이터를 ID로 찾아서 업데이트
      const updatedTableData = tableData.map(item => 
        item.id === selectedRowId 
          ? {
              ...item,
              inboundId: inboundData.stock_code,
              inbound_date: typeof inboundData.inbound_date === 'object' 
                ? inboundData.inbound_date.toISOString().slice(0, 10) 
                : inboundData.inbound_date,
              inboundQuantity: inboundData.quantity,
              unit: inboundData.unit,
              remark: inboundData.remark || ""
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
              inboundId: inboundData.stock_code,
              inbound_date: typeof inboundData.inbound_date === 'object' 
                ? inboundData.inbound_date.toISOString().slice(0, 10) 
                : inboundData.inbound_date,
              inboundQuantity: inboundData.quantity,
              unit: inboundData.unit,
              remark: inboundData.remark || ""
            });
            console.log("Tabulator update successful");
          }
        } catch (error) {
          console.log("Tabulator update failed:", error);
        }
      }
      
      // React state 업데이트
      setTableData(updatedTableData);
    }
    
    setInboundModalOpen(false);
    setSelectedRowId(null);
  };

  const columns = [
    { 
      title: "재고코드", 
      field: "inboundId", 
      width: 150,
      editor: (cell: any) => {
        const rowData = cell.getRow().getData();
        return rowData.status === 'COMPLETED' ? false : "input";
      },
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        const rowData = row.getData();
        if (rowData.status === 'COMPLETED') {
          alert('출고 완료된 데이터는 수정할 수 없습니다.');
          return;
        }
        console.log("Clicked row data:", rowData);
        handleInboundIdClick(rowData.id);
      }
    },
    { 
      title: "입고일자", 
      field: "inbound_date", 
      width: 120,
      editor: false
    },
    { 
      title: "출고일자", 
      field: "outboundDate", 
      width: 120,
      editor: (cell: any) => {
        const rowData = cell.getRow().getData();
        return rowData.status === 'COMPLETED' ? false : "date";
      },
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        if (data.rowStatus === "INSERT") {
          return; // INSERT 상태에서는 rowStatus 변경하지 않음
        }
        row.update({ rowStatus: "UPDATE" });
      }
    },
    { 
      title: "출고수량", 
      field: "outboundQuantity", 
      width: 100,
      editor: "number",
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        if (data.rowStatus === "INSERT") {
          return; // INSERT 상태에서는 rowStatus 변경하지 않음
        }
        row.update({ rowStatus: "UPDATE" });
      }
    },
    { 
      title: "단위", 
      field: "unit", 
      width: 80,
      editor: false
    },
    { 
      title: "비고", 
      field: "remark", 
      width: 200,
      editor: (cell: any) => {
        const rowData = cell.getRow().getData();
        return rowData.status === 'COMPLETED' ? false : "input";
      },
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        if (data.rowStatus === "INSERT") {
          return; // INSERT 상태에서는 rowStatus 변경하지 않음
        }
        row.update({ rowStatus: "UPDATE" });
      }
    },
    { 
      title: "출고상태", 
      field: "status", 
      width: 100,
      formatter: (cell: any) => {
        const value = cell.getValue();
        return value === 'COMPLETED' ? '✅ 완료' : '⏳ 대기';
      },
      visible: false
    },
    { 
      title: "상태", 
      field: "rowStatus", 
      width: 100 
    },
    {
      title: "삭제",
      field: "delete",
      hozAlign: "center",
      width: 60,
      formatter: () => "🗑",
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        const rowData = row.getData();
        
        // 출고 완료된 데이터는 삭제 불가
        if (rowData.status === 'COMPLETED') {
          alert('출고 완료된 데이터는 삭제할 수 없습니다.');
          return;
        }
        
        if(rowData.rowStatus === "INSERT") {
          row.delete();
        } else if(rowData.rowStatus === "DELETE") {
          // 삭제 취소
          if (tableRef.current && tableRef.current.table) {
            try {
              const tabulator = tableRef.current.table;
              const targetRow = tabulator.getRow(rowData.id);
              if (targetRow) {
                targetRow.update({ rowStatus: "" });
                targetRow.getElement().classList.remove("deleted-row");
              }
            } catch (error) {
              console.log("Row update failed:", error);
            }
          }
        } else {
          // 삭제 표시
          if (tableRef.current && tableRef.current.table) {
            try {
              const tabulator = tableRef.current.table;
              const targetRow = tabulator.getRow(rowData.id);
              if (targetRow) {
                targetRow.update({ rowStatus: "DELETE" });
                targetRow.getElement().classList.add("deleted-row");
              }
            } catch (error) {
              console.log("Row update failed:", error);
            }
          }
        }
      }
    }
  ];

  // 행 추가 핸들러
  const handleAddRow = () => {
    const newRow: OutboundItem = {
      id: `row_${Date.now()}_${tableData.length}`,
      inboundId: "",
      inbound_date: "",
      inboundQuantity: 0,
      outboundDate: new Date().toISOString().split('T')[0],
      outboundQuantity: 0,
      unit: "",
      remark: "",
      status: "PENDING",
      rowStatus: "INSERT"
    };
    setTableData([...tableData, newRow]);
  };

  // 출고 저장 핸들러
  const handleOutboundSave = async () => {
    try {
      // 변경된 데이터만 필터링 (rowStatus가 있는 것들)
      const filteredDataToSave = tableData.filter(item => 
        item.rowStatus !== "" && item.rowStatus !== undefined
      );

      // 필수 필드 검증
      const invalidItems = filteredDataToSave.filter(item => {
        return !item.inboundId || item.inboundId.trim() === '' ||
               typeof item.outboundQuantity !== 'number' || item.outboundQuantity <= 0 ||
               !item.outboundDate;
      });

      if (invalidItems.length > 0) {
        alert('필수 필드가 누락되었거나 잘못된 값이 있습니다. (재고코드, 출고수량, 출고일자를 확인해주세요)');
        return;
      }

      // 서버로 전송할 데이터 형식으로 변환
      const dataForServer = filteredDataToSave.map(item => ({
        id: item.id && !item.id.toString().startsWith('row_') ? parseInt(item.id.toString()) : undefined,
        stock_code: item.inboundId || '', // inboundId를 stock_code로 사용
        inbound_date: item.inbound_date,
        outboundDate: item.outboundDate,
        quantity: item.outboundQuantity,
        unit: item.unit || '',
        remark: item.remark || '',
        status: item.status || 'PENDING',
        rowStatus: item.rowStatus
      }));

      console.log("저장할 데이터:", dataForServer);
      
      // 서버에 저장
      await outboundService.saveOutbound(dataForServer);
      
      // 성공 메시지
      alert('출고 데이터가 성공적으로 저장되었습니다.');
      
      // 데이터 다시 로드
      await loadOutboundData();
      
    } catch (error) {
      console.error('출고 저장 실패:', error);
      alert('출고 데이터 저장에 실패했습니다.');
    }
  };

  return (
    <MDBox py={3}>
      <Card sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <StockSearch onSearch={loadOutboundData} />
      </Card>

      <Card sx={{ p: 3, height: '68vh', backgroundColor: 'white' }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="medium">
            입고된 품목을 기준으로 출고품을 등록해주세요!
          </MDTypography>
          <MDBox display="flex" gap={2}>
            <MDButton variant="outlined" color="info" onClick={handleAddRow}>
              ➕ 행 추가
            </MDButton>
            <MDButton 
              variant="gradient" 
              color="success"
              onClick={handleOutboundSave}
            >
              💾 출고 저장
            </MDButton>
          </MDBox>
        </MDBox>

        <MDBox sx={{ 
          '& .tabulator': {
            backgroundColor: 'white !important',
            border: '1px solid #eee',
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
            data={tableData}
            columns={columns}
            layout="fitDataStretch"
            options={{ 
              movableRows: true, 
              movableColumns: true,
              index: "id", // ID를 row index로 사용
              height: "100%",
              layoutColumnsOnNewData: true,
            }}
          />
        </MDBox>
      </Card>

      {/* 입고데이터 선택 모달 */}
      <InboundSelectionModal
        open={inboundModalOpen}
        onClose={() => setInboundModalOpen(false)}
        onSelect={handleInboundSelect}
      />
    </MDBox>
  );
};

export default Outbound;