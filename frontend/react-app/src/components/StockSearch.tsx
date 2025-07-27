import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Material Dashboard 2 React components
import MDBox from '../md-components/MDBox/index.jsx';
import MDButton from '../md-components/MDButton/index.jsx';
import MDInput from '../md-components/MDInput/index.jsx';

interface StockSearchProps {
  onSearch: (searchText: string, startDate?: string, endDate?: string) => void;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSearch = () => {
    onSearch(searchText, startDate?.toISOString(), endDate?.toISOString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <MDBox display="flex" gap={2} alignItems="center">
      <MDInput
        label="재고명 검색"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ flex: 1 }}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="시작 날짜"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          slotProps={{
            textField: {
              size: "medium",
              sx: {
                minWidth: 150,
                '& .MuiPickersSectionList-root': {
                  padding: '0',
                },
                '& .MuiPickersInputBase-sectionsContainer': {
                  padding: '8px 14px',
                },
                '& .MuiPickersOutlinedInput-sectionsContainer': {
                  padding: '8px 14px',
                }
              }
            }
          }}
        />
        <DatePicker
          label="종료 날짜"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          slotProps={{
            textField: {
              size: "medium",
              sx: {
                minWidth: 150,
                '& .MuiPickersSectionList-root': {
                  padding: '0',
                },
                '& .MuiPickersInputBase-sectionsContainer': {
                  padding: '8px 14px',
                },
                '& .MuiPickersOutlinedInput-sectionsContainer': {
                  padding: '8px 14px',
                }
              }
            }
          }}
        />
      </LocalizationProvider>
      <MDButton variant="gradient" color="info" onClick={handleSearch}>
        검색
      </MDButton>
    </MDBox>
  );
};
