import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Typography,
  useTheme
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useMenu } from '../../contexts/MenuContext';
import type { MenuItem } from '../../types/menu/menu.types';

// 아이콘 매핑 객체 - 문자열과 아이콘 컴포넌트를 연결
const iconMap: Record<string, React.ReactNode> = {
  'dashboard': <DashboardIcon />,
  'inventory': <InventoryIcon />,
  'users': <PeopleIcon />,
  'settings': <SettingsIcon />,
  'shipping': <LocalShippingIcon />,
  'orders': <ReceiptIcon />,
};

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  drawerWidth, 
  mobileOpen, 
  handleDrawerToggle 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItems, loading } = useMenu();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // 메뉴 클릭 핸들러
  const handleMenuClick = (path: string) => {
    navigate(path);
    // 모바일에서는 메뉴 클릭 후 사이드바를 닫음
    if (window.innerWidth < theme.breakpoints.values.md) {
      handleDrawerToggle();
    }
  };

  // 하위 메뉴 토글 핸들러
  const handleSubMenuToggle = (id: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 메뉴 항목이 현재 활성화되어 있는지 확인
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 메뉴 아이콘 생성 함수
  const getMenuIcon = (iconName?: string) => {
    if (!iconName) return <DashboardIcon />;
    return iconMap[iconName] || <DashboardIcon />;
  };

  // 재귀적으로 메뉴 렌더링 함수
  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    
    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleSubMenuToggle(item.id)}
              sx={{
                bgcolor: openMenus[item.id] ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
              }}
            >
              <ListItemIcon>
                {getMenuIcon(item.icon)}
              </ListItemIcon>
              <ListItemText primary={item.name} />
              {openMenus[item.id] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus[item.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderMenuItem(child))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
    
    return (
      <ListItem disablePadding key={item.id}>
        <ListItemButton 
          onClick={() => handleMenuClick(item.path)}
          selected={isActive(item.path)}
          sx={{
            pl: item.parentId ? 4 : 2,
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main + '20',
              borderRight: `3px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: theme.palette.primary.main + '30',
              }
            }
          }}
        >
          <ListItemIcon>
            {getMenuIcon(item.icon)}
          </ListItemIcon>
          <ListItemText primary={item.name} />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}` 
      }}>
        <Typography variant="h6" noWrap component="div">
          재고 관리 시스템
        </Typography>
      </Box>
      <List>
        {loading ? (
          <ListItem>
            <ListItemText primary="메뉴 로딩 중..." />
          </ListItem>
        ) : menuItems.length > 0 ? (
          menuItems.map(item => renderMenuItem(item))
        ) : (
          <ListItem>
            <ListItemText primary="메뉴 항목이 없습니다" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="메뉴 네비게이션"
    >
      {/* 모바일 사이드바 */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // 모바일 성능 향상을 위함
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      {/* 데스크톱 사이드바 */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
