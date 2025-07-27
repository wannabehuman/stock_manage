import React, { useRef, useState, useEffect } from 'react';
import { ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css";
import "tabulator-tables/dist/css/tabulator.min.css";
import { DefaultButton } from '../components/button/defaultButton';
import { StockSearch } from '../components/StockSearch';
import { outboundService } from '../services/outbound.service';
import { inboundService } from '../services/inbound.service';
import './RecentStock.css';

// Material Dashboard 2 React components
import MDBox from '../md-components/MDBox/index.jsx';
import MDButton from '../md-components/MDButton/index.jsx';
import MDTypography from '../md-components/MDTypography/index.jsx';
import { Card } from '@mui/material';

interface OutboundItem {
  id: number;
  inboundId: number;
  inbound_date: string;
  inboundQuantity: number;
  outboundDate: string;
  outboundQuantity: number;
  unit: string;
}

const Outbound: React.FC = () => {
  const tableRef = useRef<any>(null);
  const [tableData, setTableData] = useState<OutboundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutboundData();
  }, []);

  const loadOutboundData = async () => {
    try {
      const outboundItems = await outboundService.getAll();
      const inboundItems = await inboundService.getAll();

      const combinedData = outboundItems.map(outbound => {
        const inbound = inboundItems.find(i => i.id === outbound.inboundId);
        return {
          id: outbound.id,
          inboundId: outbound.inboundId,
          inbound_date: inbound?.inbound_date || '',
          inboundQuantity: inbound?.quantity || 0,
          outboundDate: outbound.outboundDate,
          outboundQuantity: outbound.quantity,
          unit: outbound.unit,
          rowStatus: '',
          delete: ''
        };
      });

      setTableData(combinedData);
    } catch (error) {
      console.error('Error loading outbound data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "입고ID", field: "inboundId", width: 100 },
    { title: "입고일자", field: "inbound_date", width: 120 },
    { title: "입고수량", field: "inboundQuantity", width: 100 },
    { title: "출고일자", field: "outboundDate", width: 120 },
    { title: "출고수량", field: "outboundQuantity", width: 100 },
    { title: "단위", field: "unit", width: 80 },
    { title: "상태", field: "rowStatus", width: 80 },
    { title: "삭제", field: "delete", width: 80 }
  ];

  return (
    <MDBox py={3}>
      <Card sx={{ p: 3, mb: 3 }}>
        <StockSearch onSearch={loadOutboundData} />
      </Card>

      <Card sx={{ p: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="medium">
            입고된 품목을 기준으로 출고품을 등록해주세요!
          </MDTypography>
        </MDBox>

        <MDBox sx={{ 
          '& .tabulator': {
            backgroundColor: 'transparent',
            border: 'none',
          },
          '& .tabulator-header': {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
          },
          '& .tabulator-col': {
            backgroundColor: 'transparent',
          },
          '& .tabulator-cell': {
            borderRight: '1px solid #dee2e6',
          },
          '& .tabulator-row:hover': {
            backgroundColor: '#f8f9fa',
          }
        }}>
          <ReactTabulator
            ref={tableRef}
            data={tableData}
            columns={columns}
            layout="fitColumns"
            options={{ 
              movableRows: true, 
              movableColumns: true,
            }}
          />
        </MDBox>
      </Card>
    </MDBox>
  );
};

export default Outbound;