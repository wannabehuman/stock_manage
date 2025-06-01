import api from './api';
import type { MenuItem } from '../types/menu/menu.types';

// 모든 메뉴 항목 가져오기
export const getAllMenus = async (): Promise<MenuItem[]> => {
  const response = await api.get<MenuItem[]>('/menu');
  return response.data;
};

// 계층형 메뉴 구조 가져오기
export const getMenuTree = async (): Promise<MenuItem[]> => {
  const response = await api.get<MenuItem[]>('/menu/tree');
  return response.data;
};

// 사용자 권한에 맞는 메뉴 가져오기
export const getMyMenu = async (): Promise<MenuItem[]> => {
  const response = await api.get<MenuItem[]>('/menu/my-menu');
  return response.data;
};

// 메뉴 상세 정보 가져오기
export const getMenuById = async (id: string): Promise<MenuItem> => {
  const response = await api.get<MenuItem>(`/menu/${id}`);
  return response.data;
};

// 새 메뉴 생성 (관리자용)
export const createMenu = async (menuData: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await api.post<MenuItem>('/menu', menuData);
  return response.data;
};

// 메뉴 업데이트 (관리자용)
export const updateMenu = async (id: string, menuData: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await api.patch<MenuItem>(`/menu/${id}`, menuData);
  return response.data;
};

// 메뉴 삭제 (관리자용)
export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/menu/${id}`);
};
