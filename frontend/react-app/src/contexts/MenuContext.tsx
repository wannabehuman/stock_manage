import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMyMenu } from '../services/menu.service';
import type { MenuItem } from '../types/menu/menu.types';
import { useAuth } from './AuthContext';

// 메뉴 컨텍스트 인터페이스 정의
interface MenuContextType {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
}

// 컨텍스트 생성
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // 메뉴 데이터 로드 함수
  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isAuthenticated) {
        const data = await getMyMenu();
        setMenuItems(data);
      } else {
        setMenuItems([]);
      }
    } catch (err: any) {
      setError(err.message || '메뉴를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  // 인증 상태가 변경될 때 메뉴 다시 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchMenus();
    } else {
      setMenuItems([]);
    }
  }, [isAuthenticated]);

  // 메뉴 강제 새로고침 함수
  const refreshMenus = async () => {
    await fetchMenus();
  };

  // 컨텍스트 값
  const contextValue: MenuContextType = {
    menuItems,
    loading,
    error,
    refreshMenus
  };

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};

// 메뉴 컨텍스트 사용을 위한 커스텀 훅
export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu는 MenuProvider 내에서 사용해야 합니다');
  }
  return context;
};
