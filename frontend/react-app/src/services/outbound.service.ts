import axios from 'axios';

interface OutboundItem {
  id: number;
  inboundId: number;
  outboundDate: string;
  quantity: number;
  unit: string;
}

export const outboundService = {
  async getAll(): Promise<OutboundItem[]> {
    const response = await axios.get('/outbound');
    return response.data;
  },

  async getByInbound(stock_code: string, inbound_date: string): Promise<OutboundItem[]> {
    const response = await axios.get(`/outbound/inbound/${stock_code}/${inbound_date}`);
    return response.data;
  },

  async getByDate(date: string): Promise<OutboundItem[]> {
    const response = await axios.get(`/outbound/date/${date}`);
    return response.data;
  },

  async create(outbound: Omit<OutboundItem, 'id'>): Promise<OutboundItem> {
    const response = await axios.post('/outbound', outbound);
    return response.data;
  },

  async update(id: number, outbound: Partial<OutboundItem>): Promise<OutboundItem> {
    const response = await axios.put(`/outbound/${id}`, outbound);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/outbound/${id}`);
  }
};