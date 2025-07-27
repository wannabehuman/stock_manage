// Material Dashboard 2 React layouts
import Dashboard from './components/Dashboard';
import Inbound from './pages/inbound';
import Outbound from './pages/outbound';
import BaseCodeManagement from './pages/BaseCodeManagement';
import UserApproval from './components/auth/UserApproval';

// @mui icons
// import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "대시보드",
    key: "dashboard",
    route: "/dashboard",
    component: Dashboard,
  },
  {
    type: "collapse",
    name: "입고 관리",
    key: "inbound",
    route: "/inbound",
    component: Inbound,
  },
  {
    type: "collapse",
    name: "출고 관리", 
    key: "outbound",
    route: "/outbound",
    component: Outbound,
  },
  {
    type: "collapse",
    name: "재고 현황",
    key: "stock",
    route: "/stock",
    component: Dashboard,
  },

  {
    type: "collapse",
    name: "기초코드 관리",
    key: "base_code", 
    route: "/base_code",
    component: BaseCodeManagement,
  },
  {
    type: "collapse",
    name: "사용자 승인",
    key: "user-approval",
    route: "/admin/users", 
    component: UserApproval,
  },
];

export default routes;