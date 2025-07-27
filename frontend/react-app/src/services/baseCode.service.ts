import api from './api';
interface BaseCode {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  max_use_period: number;
  remark: string;
  isAlert: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export const baseCodeService = {
  async getAll(): Promise<BaseCode[]> {
    const response = await api.get('/stock-base');
    return response.data;
  },

  async create(baseCode: Omit<BaseCode, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>): Promise<BaseCode> {
    const response = await api.post<BaseCode>('/stock-base', baseCode);
    return response.data;
  },

  async update(code: string, baseCode: BaseCode): Promise<BaseCode> {
    const response = await api.put<BaseCode>(`/stock-base/${code}`, baseCode);
    return response.data;
  },

  async delete(code: string): Promise<void> {
    await api.delete(`/stock-base/${code}`);
  },

  async getByCategory(category: string): Promise<BaseCode[]> {
    const response = await api.get(`/stock-base/category/${category}`);
    return response.data;
  }
};