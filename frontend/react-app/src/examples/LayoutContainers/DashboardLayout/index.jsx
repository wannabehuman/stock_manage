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
        p: 3,
        position: "relative",
        minHeight: "100vh",
        
        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(5) : pxToRem(20),
          width: miniSidenav ? `calc(100vw - ${pxToRem(56)})` : `calc(100vw - ${pxToRem(270)})`,
          transition: transitions.create(["margin-left", "margin-right", "width"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
        
        [breakpoints.down("xl")]: {
          width: "100%",
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
