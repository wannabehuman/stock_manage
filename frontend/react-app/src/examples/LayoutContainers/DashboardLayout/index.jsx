/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect } from "react";

// react-router-dom components
import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../md-components/MDBox/index.jsx";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "../../../md-context/index.jsx";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: { xs: 2, sm: 3, md: 4 },
        position: "relative",
        minHeight: "100vh",
        
        // 모든 화면 크기에서 사이드바 너비를 고려
        [breakpoints.up("md")]: {
          marginLeft: miniSidenav ? pxToRem(56) : pxToRem(270),
          width: miniSidenav ? `calc(100vw - ${pxToRem(56)})` : `calc(100vw - ${pxToRem(270)})`,
          transition: transitions.create(["margin-left", "width"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
        
        // 모바일에서는 전체 너비 사용
        [breakpoints.down("md")]: {
          width: "100%",
          marginLeft: 0,
        },
        
        // 큰 화면에서 최대 너비 제한 제거 및 여백 조정
        [breakpoints.up("xl")]: {
          maxWidth: "none",
          p: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        },
      })}
    >
      {children}
    </MDBox>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
