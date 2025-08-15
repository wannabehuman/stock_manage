import React, { useRef, useState, useEffect } from 'react';
import { ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css";
import "tabulator-tables/dist/css/tabulator.min.css";
import { DefaultButton } from '../components/button/defaultButton';
import { OutHistoryModal } from '../components/OutHistoryModal';
import { StockSearch } from '../components/StockSearch';
import './RecentStock.css';
import { saveStock, getAllStocks } from '../services/stock.service';

interface StockItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  location: string;
  initialQuantity: number;
  outQuantity: number;
  stockQuantity: number;
  lastUpdated: string;
  stockUpdateReason: string;
  rowStatus?: string;
  delete?: string;
}

const RecentStock: React.FC = () => {
  const tableRef = useRef<any>(null);

  const [tableData, setTableData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocks = await getAllStocks();
        setTableData(stocks);
        setFilteredData(stocks);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        alert('재고 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchStocks();
  }, []);

  const handleSearch = (searchText: string, startDate?: string, endDate?: string) => {
    let filtered = [...tableData];
    
    if (searchText) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.lastUpdated);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredData(filtered);
  };

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{
    date: string;
    quantity: number;
    reason: string;
  }[]>([]);

  const handleHistoryClick = (cell: any) => {
    // const row = cell.getRow();
    // const item = row.getData();
    
    // 여기에 실제 API 호출 로직을 추가
    const mockHistory = [
      { date: '2023-07-13', quantity: 10, reason: '판매' },
      { date: '2023-07-12', quantity: 5, reason: '반품' },
      { date: '2023-07-11', quantity: 3, reason: '폐기' }
    ];

    setSelectedHistory(mockHistory);
    setIsHistoryModalOpen(true);
  };

  const columns = [
    { title: "ID", field: "id", width: 100, hozAlign: "center", titleHozAlign: "center" },
    { title: "재고명", field: "name", editor: "input", width: 200, hozAlign: "center", titleHozAlign: "center" },
    { title: "출고수량", field: "outQuantity", width: 100, editor: "number", hozAlign: "right", titleHozAlign: "center", cellEdited: (cell: any) => {
       const row = cell.getRow();
       const data = row.getData();
       if (data.rowStatus !== "INSERT") {
         row.update({ rowStatus: "UPDATE" });
       }
       console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
     } },
    { title: "재고수량", field: "stockQuantity", width: 100, editor: "number", hozAlign: "right", titleHozAlign: "center", cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        if (data.rowStatus !== "INSERT") {
          row.update({ rowStatus: "UPDATE" });
        }
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      } },
    { title: "최초입고수량", field: "initialQuantity", width: 130, editor: "number", hozAlign: "right", titleHozAlign: "center", cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        if (data.rowStatus !== "INSERT") {
          row.update({ rowStatus: "UPDATE" });
        }
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      } },
    { title: "단위", field: "unit", width: 100, editor: "input", hozAlign: "center", titleHozAlign: "center" },
    { title: "위치", field: "location", width: 100, editor: "input", hozAlign: "center", titleHozAlign: "center" },
    { 
      title: "출고이력", 
      field: "lastUpdated",
      width: 100,
      hozAlign: "center",
      titleHozAlign: "center",
      formatter: () => "🔍",
      cellClick: handleHistoryClick
    },
    { title: "재고수정사유", field: "stockUpdateReason", width: 100, editor:"input", hozAlign: "center", titleHozAlign: "center",
      cellEdited: (cell: any) => {
        const row = cell.getRow();
        const data = row.getData();
        if (data.rowStatus !== "INSERT") {
          row.update({ rowStatus: "UPDATE" });
        }
        console.log("✅ 편집됨:", cell.getField(), "→", cell.getValue());
      } 
     },
    { title: "행상태", field: "rowStatus", width: 100, hozAlign: "center", titleHozAlign: "center" },
    {
      title: "삭제",
      field: "delete",
      hozAlign: "center",
      titleHozAlign: "center",
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
    const newId = Date.now();
    const newRow: StockItem = {
      id: newId,
      name: "",
      quantity: 0,
      unit: "",
      location: "",
      initialQuantity: 0,
      outQuantity: 0,
      stockQuantity: 0,
      stockUpdateReason: "",

      lastUpdated: new Date().toISOString().split("T")[0],
      rowStatus: "INSERT",
    };

    tableRef.current?.table?.addRow(newRow, true); // UI에 추가
    setTableData(prev => [newRow, ...prev]);       // 원본 데이터에 추가
    setFilteredData(prev => [newRow, ...prev]);    // 필터링된 데이터도 업데이트!
  };
  const handleStockUpdate = () => {

  };

  return (
    <div>
      <h2>React + Tabulator 예제</h2>
      <StockSearch onSearch={handleSearch} />
      <button onClick={handleAddRow}>➕ 행 추가</button>
      <DefaultButton
        text="재고 저장"
        onClick={() => {
          const filteredData = tableData.filter(item => item.rowStatus !== "" && item.rowStatus !== undefined && item.rowStatus !== null);
          saveStock(filteredData)
            .then(() => {
              getAllStocks()
                .then((stocks) => {
                  setTableData(stocks);
                  setFilteredData(stocks);
                })
                .catch((error) => {
                  console.error('Error fetching stocks:', error);
                });
            })
            .catch((error) => {
              console.error('Error:', error);
              if (error instanceof Error) {
                alert(error.message);
              } else {
                alert('알 수 없는 오류가 발생했습니다.');
              }
            });
        }}
        onSuccess={handleStockUpdate}
        onError={(error) => {
          if (error instanceof Error) {
            alert(error.message);
          } else {
            alert('알 수 없는 오류가 발생했습니다.');
          }
        }}
      />
      <ReactTabulator
        ref={tableRef}
        data={filteredData}
        columns={columns}
        layout="fitColumns"
        options={{ 
          movableRows: true, 
          movableColumns: true,

        }}
      />
      <OutHistoryModal
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={selectedHistory}
      />
    </div>
  );
};

export default RecentStock;
