import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface OutHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: {
    date: string;
    quantity: number;
    reason: string;
  }[];
}

export const OutHistoryModal: React.FC<OutHistoryModalProps> = ({ open, onClose, history }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>출고 이력</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {history.map((item, index) => (
            <div key={index} style={{ marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <p><strong>날짜:</strong> {item.date}</p>
              <p><strong>수량:</strong> {item.quantity}</p>
              <p><strong>사유:</strong> {item.reason}</p>
            </div>
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};
