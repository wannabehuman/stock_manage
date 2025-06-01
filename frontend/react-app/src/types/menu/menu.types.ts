// 사용자 역할 값 객체
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;

// 사용자 역할 타입
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// 메뉴 아이템 인터페이스
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  roles?: string[];
  children?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

// 메뉴 응답 인터페이스
export interface MenuResponse {
  success: boolean;
  message?: string;
  data?: MenuItem[];
}
