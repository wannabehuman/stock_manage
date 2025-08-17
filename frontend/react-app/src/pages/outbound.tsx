import React, { useRef, useState, useEffect } from 'react';
import { ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css";
import "tabulator-tables/dist/css/tabulator.min.css";
import { DefaultButton } from '../components/button/defaultButton';
import { StockSearch } from '../components/StockSearch';
import { outboundService } from '../services/outbound.service';
import { inboundService } from '../services/inbound.service';
import { baseCodeService } from '../services/baseCode.service';
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
  inboundName?: string; // 입고 재고명 추가
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
  const [tableData, setTableData] = useState<OutboundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inboundModalOpen, setInboundModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadOutboundData();
  }, []);

  // 알림 메시지 자동 숨김
  useEffect(() => {
    if (notification.open) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 5000); // 5초 후 자동 숨김

      return () => clearTimeout(timer);
    }
  }, [notification.open]);

  const loadOutboundData = async () => {
    try {
      // 출고 데이터와 기초코드 데이터를 동시에 가져오기
      const [outboundItems, baseCodeData] = await Promise.all([
        outboundService.getAll(),
        baseCodeService.getAll()
      ]);
      
      console.log("Loaded outbound data:", outboundItems);
      
      // 기초코드를 코드별로 매핑하여 빠른 검색을 위한 맵 생성
      const baseCodeMap = baseCodeData.reduce((map: any, baseCode: any) => {
        map[baseCode.code] = baseCode;
        return map;
      }, {});
      
      // 기존 데이터에 ID가 없으면 추가하고, 서버 데이터 구조에 맞게 변환
      const dataWithIds = outboundItems.map((item: any, index: number) => ({
        id: item.id ? item.id.toString() : `existing_${Date.now()}_${index}`,
        inboundId: item.stock_code || "", // stock_code를 inboundId로 매핑
        inboundName: baseCodeMap[item.stock_code]?.name || item.stock_code, // 기초코드에서 이름 가져오기
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
      
      // 데이터가 없으면 빈 행 하나 추가
      if (dataWithIds.length === 0) {
        const emptyRow: OutboundItem = {
          id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          inboundId: "",
          inboundName: "",
          inbound_date: "",
          inboundQuantity: 0,
          outboundDate: new Date().toISOString().split('T')[0],
          outboundQuantity: 0,
          unit: "",
          remark: "",
          status: "PENDING",
          rowStatus: "INSERT"
        };
        setTableData([emptyRow]);
      } else {
        setTableData(dataWithIds);
      }
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
              inboundName: inboundData.stock_name || inboundData.name || inboundData.stock_code, // 재고명 추가
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
              inboundName: inboundData.stock_name, // 재고명 추가
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
      hozAlign: "center",
      titleHozAlign: "center",
      visible: false, // 코드는 숨김
      editor: (cell: any) => {
        const rowData = cell.getRow().getData();
        return rowData.status === 'COMPLETED' ? false : "input";
      },
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        const rowData = row.getData();

        // console.log("Clicked row data:", rowData);
        handleInboundIdClick(rowData.id);
      }
    },
    { 
      title: "재고명", 
      field: "inboundName", 
      width: 150,
      hozAlign: "center",
      titleHozAlign: "center",
      editor: false, // 편집 불가
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        const rowData = row.getData();
        handleInboundIdClick(rowData.id);
      }
    },
    { 
      title: "입고일자", 
      field: "inbound_date", 
      width: 150,
      hozAlign: "center",
      titleHozAlign: "center",
      editor: false,
    },
    { 
      title: "출고일자", 
      field: "outboundDate", 
      width: 150,
      hozAlign: "center",
      titleHozAlign: "center",
      editor: (cell: any) => {
        const rowData = cell.getRow().getData();
        return rowData.status === 'COMPLETED' ? false : "date";
      },
      formatter: (cell: any) => {
        const value = cell.getValue();
        if (!value || value === "") {
          return "📅 날짜 선택";
        }
        return value;
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
      width: 150,
      hozAlign: "right",
      titleHozAlign: "center",
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
      width: 100,
      hozAlign: "center",
      titleHozAlign: "center",
      editor: false
    },
    { 
      title: "비고", 
      field: "remark", 
      width: 500,
      hozAlign: "left",
      titleHozAlign: "center",
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
      hozAlign: "center",
      titleHozAlign: "center",
      formatter: (cell: any) => {
        const value = cell.getValue();
        return value === 'COMPLETED' ? '✅ 완료' : '⏳ 대기';
      },
      visible: false
    },
    { 
      title: "상태", 
      field: "rowStatus", 
      width: 100,
      hozAlign: "center",
      titleHozAlign: "center",
      visible: false
    },
    {
      title: "삭제",
      field: "delete",
      hozAlign: "center",
      titleHozAlign: "center",
      frozen: true,
      width: 50,
      formatter: () => "🗑",
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        const rowData = row.getData();
        
        if(rowData.rowStatus === "INSERT") {
          // INSERT 상태인 행은 완전히 제거
          row.delete();
          setTableData((prev) => prev.filter((item) => item.id !== rowData.id));
        } else if(rowData.rowStatus === "DELETE") {
          // DELETE 상태를 취소하고 원래 상태로 복구
          row.update({ rowStatus: "" });
          row.getElement().classList.remove("deleted-row");
          setTableData((prev) => prev.map((item) => item.id === rowData.id ? { ...item, rowStatus: "" } : item));
        } else {
          // 기존 행을 DELETE 상태로 표시
          row.update({ rowStatus: "DELETE" });
          row.getElement().classList.add("deleted-row");
          setTableData((prev) => prev.map((item) => item.id === rowData.id ? { ...item, rowStatus: "DELETE" } : item));
        }
      }
    },
  ];

  // 행 추가 핸들러
  const handleAddRow = () => {
    const newRow: OutboundItem = {
      id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inboundId: "",
      inboundName: "", // 재고명 추가
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
        setNotification({
          open: true,
          message: '필수 필드가 누락되었거나 잘못된 값이 있습니다. (재고코드, 출고수량, 출고일자를 확인해주세요)',
          type: 'error'
        });
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
      setNotification({
        open: true,
        message: '출고 데이터가 성공적으로 저장되었습니다!',
        type: 'success'
      });
      
      // 데이터 다시 로드
      await loadOutboundData();
      
    } catch (error) {
      console.error('출고 저장 실패:', error);
      setNotification({
        open: true,
        message: '출고 데이터 저장에 실패했습니다.',
        type: 'error'
      });
    }
  };

  return (
    <MDBox py={3} sx={{ minWidth: '1200px', overflowX: 'auto' }}>
      <Card sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <StockSearch onSearch={loadOutboundData} />
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
          flex: 1,
          overflow: 'auto',
          minWidth: '1200px',
          '& .tabulator': {
            backgroundColor: 'white !important',
            border: '1px solid #eee',
            width: '100% !important',
            height: '100% !important',
            fontSize: { xs: '12px', sm: '13px', md: '14px' },
            minWidth: '1200px',
          },
          '& .tabulator-tableholder': {
            overflow: 'auto !important',
            maxHeight: { xs: 'calc(50vh - 120px)', sm: 'calc(55vh - 120px)', md: 'calc(65vh - 120px)' },
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
            borderRight: 'none !important',
            borderBottom: 'none !important',
          },
          '& .tabulator-row': {
            backgroundColor: 'white',
            borderBottom: 'none !important',
          },
          '& .tabulator-cell input': {
            color: '#000000 !important',
            backgroundColor: 'white !important',
          },
          '& .tabulator-cell input:focus': {
            color: '#000000 !important',
            backgroundColor: 'white !important',
          },
          '& .tabulator-editor input': {
            color: '#000000 !important',
            backgroundColor: 'white !important',
          },
          '& .tabulator-editor input:focus': {
            color: '#000000 !important',
            backgroundColor: 'white !important',
          },
          '& .tabulator-editor input[type="date"]': {
            position: 'relative',
            color: '#000000 !important',
            backgroundColor: 'white !important',
            width: '100%',
            padding: '8px 30px 8px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          },
          '& .tabulator-editor input[type="date"]::-webkit-calendar-picker-indicator': {
            position: 'absolute',
            right: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            opacity: 1,
            color: '#666',
            background: 'none',
            border: 'none',
            width: '20px',
            height: '20px',
          },
          '& .tabulator-editor input[type="date"]:focus': {
            outline: '2px solid #1976d2',
            outlineOffset: '-1px',
          },
          '& .tabulator-row:hover': {
            backgroundColor: '#f5f5f5 !important',
          },
          '& .tabulator-row-even': {
            backgroundColor: 'white',
          },
          '& .tabulator-row-odd': {
            backgroundColor: 'white',
          },
          '& .tabulator-row.deleted-row': {
            backgroundColor: '#ffebee !important',
            textDecoration: 'line-through',
            opacity: 0.6,
          },
          '& .tabulator-row.deleted-row .tabulator-cell': {
            backgroundColor: '#ffebee !important',
          },
          '& .tabulator-row.insert-row': {
            backgroundColor: '#e3f2fd !important', // 파란색 배경 (INSERT)
          },
          '& .tabulator-row.insert-row .tabulator-cell': {
            backgroundColor: '#e3f2fd !important',
          },
          '& .tabulator-row.update-row': {
            backgroundColor: '#e8f5e9 !important', // 초록색 배경 (UPDATE)
          },
          '& .tabulator-row.update-row .tabulator-cell': {
            backgroundColor: '#e8f5e9 !important',
          }
        }}>
          <ReactTabulator
            ref={tableRef}
            data={tableData}
            columns={columns}
            layout="fitDataStretch"
            options={{ 
              movableRows: false, 
              movableColumns: false,
              index: "id", // ID를 row index로 사용
              height: "100%",
              layoutColumnsOnNewData: true,
              rowFormatter: (row: any) => {
                const data = row.getData();
                const element = row.getElement();
                
                // 기존 클래스 제거
                element.classList.remove("insert-row", "update-row", "deleted-row");
                
                // rowStatus에 따라 클래스 추가
                if (data.rowStatus === "INSERT") {
                  element.classList.add("insert-row");
                } else if (data.rowStatus === "UPDATE") {
                  element.classList.add("update-row");
                } else if (data.rowStatus === "DELETE") {
                  element.classList.add("deleted-row");
                }
              }
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

      {/* 알림 메시지 */}
      {notification.open && (
        <div 
          className={`notification notification-${notification.type}`}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '4px',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            zIndex: 1100,
            backgroundColor: notification.type === 'success' ? '#43a047' : 
                           notification.type === 'error' ? '#e53935' : '#1e88e5',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          {notification.message}
        </div>
      )}
    </MDBox>
  );
};

export default Outbound;