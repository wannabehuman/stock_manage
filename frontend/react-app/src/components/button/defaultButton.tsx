import React, { useState } from 'react';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps {
  text: string;
onClick: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const DefaultButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      onClick();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      if (onError) {
        onError();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MuiButton
      variant="contained"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? '로딩 중...' : text}
    </MuiButton>
  );
};