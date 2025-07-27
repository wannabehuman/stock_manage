import api from './api';
import type { Stock, InboundItem } from '../types/stock/stock.types';

export const getAllStocks = async (): Promise<Stock[]> => {
  const response = await api.get<Stock[]>('/stocks');
  return response.data;
};

export const getMyStock = async (): Promise<Stock[]> => {
  const response = await api.get<Stock[]>('/stock');
  return response.data;
};

export const saveStock = async (stockData: Partial<InboundItem>[]): Promise<InboundItem[]> => {
  const response = await api.post<InboundItem[]>('/stocks', stockData);
  return response.data;
};
