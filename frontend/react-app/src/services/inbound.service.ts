import api from './api';
interface InboundItem {
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

export const inboundService = {
  async getAll(): Promise<InboundItem[]> {
    const response = await api.get<InboundItem[]>('/inbound');
    return response.data.map((item: InboundItem) => ({
      ...item,
      inbound_date: item.inbound_date
    }));
  },

  async getBystock_code(stock_code: string): Promise<InboundItem[]> {
    const response = await api.get<InboundItem[]>(`/inbound/stock/${stock_code}`);
    return response.data.map((item: InboundItem) => ({
      ...item,
      inbound_date: item.inbound_date
    }));
  },

  async getByDate(date: string): Promise<InboundItem[]> {
    const response = await api.get(`/inbound/date/${date}`);
    return response.data.map((item: InboundItem) => ({
      ...item,
      inbound_date: item.inbound_date
    }));
  },

  async saveStock(stockData: InboundItem[]): Promise<InboundItem[]> {
    const formattedData = stockData.map(item => ({
      ...item,
      inbound_date: item.inbound_date instanceof Date 
        ? item.inbound_date.toISOString().split('T')[0].substring(0, 10)
        : item.inbound_date
    }));
    // console.log("✅ 저장됨:", formattedData);
    const response = await api.post('/inbound', formattedData);
    return response.data;
  },

  async deleteStock(stock_code: string, inbound_date: string): Promise<void> {
    await api.delete(`/inbound/${stock_code}/${inbound_date}`);
  }
};