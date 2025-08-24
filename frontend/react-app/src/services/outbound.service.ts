import api from './api';

interface OutboundItem {
  id?: string | number;
  stock_code: string;
  inbound_date?: Date | string;
  outboundDate: Date | string;
  quantity: number;
  unit?: string;
  remark?: string;
  status?: string;
  rowStatus?: string;
}

export const outboundService = {
  async getAll(): Promise<OutboundItem[]> {
    const response = await api.get<OutboundItem[]>('/outbound');
    return response.data.map((item: OutboundItem) => ({
      ...item,
      outboundDate: item.outboundDate
    }));
  },

  async getByStock(stock_code: string): Promise<OutboundItem[]> {
    const response = await api.get<OutboundItem[]>(`/outbound/stock/${stock_code}`);
    return response.data.map((item: OutboundItem) => ({
      ...item,
      outboundDate: item.outboundDate
    }));
  },

  async getByDate(date: string): Promise<OutboundItem[]> {
    const response = await api.get(`/outbound/date/${date}`);
    return response.data.map((item: OutboundItem) => ({
      ...item,
      outboundDate: item.outboundDate
    }));
  },

  async saveOutbound(outboundData: OutboundItem[]): Promise<OutboundItem[]> {
    const formattedData = outboundData.map(item => ({
      ...item,
      outboundDate: item.outboundDate instanceof Date 
        ? item.outboundDate.toISOString().split('T')[0]
        : item.outboundDate,
      inbound_date: item.inbound_date instanceof Date 
        ? item.inbound_date.toISOString().split('T')[0]
        : item.inbound_date
    }));
    
    console.log("✅ 출고 데이터 저장:", formattedData);
    const response = await api.post('/outbound', formattedData);
    return response.data;
  },

  async deleteOutbound(id: number): Promise<void> {
    await api.delete(`/outbound/${id}`);
  }
};