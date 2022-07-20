import React, { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { AppBar, Box, Button, IconButton, Toolbar } from "@mui/material";
import { get } from "lodash";
import useIsWidthDown from "hooks/useIsWidthDown";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "images/logo-horizontal.svg";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

function Header({ currentUser, includingPrimaryMenu, togglePrimaryMenuExpandedAtMobileRes }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const isSmallDevice = useIsWidthDown("md");
  const [nameFirst, setNameFirst] = useState("");

  useEffect(() => {
    let newNameFirst = "";
    if (currentUser) {
      newNameFirst = get(currentUser, "data.name_first", "");
    }
    if (mounted.current) {
      setNameFirst(newNameFirst);
    }
  }, [currentUser]);

  return (
    <React.Fragment>
      <Box className="only-print" sx={{ textAlign: "center" }}>
        <img alt="Healthier Generation" sx={{ width: "260px" }} src={logo} />
      </Box>
      <Box
        className="no-print"
        sx={{
          left: 0,
          minWidth: styleVars.siteMinWidth,
          position: {
            xs: "absolute",
            md: "fixed",
          },
          top: 0,
          width: "100%",
          zIndex: "appBar",
        }}
      >
        <AppBar
          position="sticky"
          color="inherit"
          role="banner"
          sx={{
            backgroundColor: "color.white",
            borderTop: "4px solid #E13F00",
            boxShadow: "0 2px 4px 0 rgba(148,148,148,0.5)",
            minWidth: styleVars.siteMinWidth,
            padding: {
              xs: "2px 0 0 0",
              md: "0",
            },
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Toolbar variant="dense">
            {includingPrimaryMenu && isSmallDevice && (
              <IconButton
                onClick={togglePrimaryMenuExpandedAtMobileRes}
                color="primary"
                aria-label="Menu"
                size="large"
                sx={{ ...sxHeaderButton }}
              >
                <MenuIcon sx={{ fontSize: "2.2rem" }} />
              </IconButton>
            )}

            <Box
              component="a"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "block",
                lineHeight: 0,
                margin: {
                  xs: "0 auto",
                  md: "0",
                },
                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              <Box
                component="img"
                alt="Healthier Generation"
                src={logo}
                sx={{
                  maxWidth: {
                    xs: "90%",
                    md: "unset",
                  },
                  width: {
                    xs: "260px",
                    md: "238px",
                  },
                }}
              />
            </Box>

            {!isSmallDevice && (
              <Fragment>
                {/* (just a divider bar) */}
                <Box
                  sx={{
                    backgroundColor: "#B5B5B5",
                    height: "25px",
                    marginLeft: 2,
                    marginRight: 2,
                    width: "1px",
                  }}
                ></Box>

                {/* SITE TITLE */}
                <Link to="/app">
                  <Box
                    sx={{
                      color: "#757575", // was #8A8A8A but contrast too low -ak, 9/3/2020
                      fontSize: styleVars.txtFontSizeXs,
                      fontWeight: styleVars.txtFontWeightDefaultSemibold,
                      lineHeight: 1,
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    Action Center
                  </Box>
                </Link>
              </Fragment>
            )}

            {includingPrimaryMenu && (
              <React.Fragment>
                <Box sx={{ marginLeft: "auto" }}>
                  {!currentUser.isAuthenticated && !currentUser.loading ? (
                    <React.Fragment>
                      {/*  MOBILE LOGIN BUTTON */}
                      {isSmallDevice && (
                        <IconButton
                          aria-label="Log in"
                          color="primary"
                          component={Link}
                          to="/app/account/login"
                          size="large"
                          sx={{
                            ...sxHeaderButton,
                            marginLeft: "auto",
                          }}
                        >
                          <LockIcon sx={{ fontSize: "2rem" }} />
                        </IconButton>
                      )}

                      {/*  DESKTOP LOGIN BUTTON */}
                      {!isSmallDevice && (
                        <Button
                          color="primary"
                          component={Link}
                          to="/app/account/login"
                          sx={{
                            ...sxHeaderButton,
                            ...sxDesktopNavButton,
                          }}
                        >
                          Log in
                        </Button>
                      )}
                    </React.Fragment>
                  ) : (
                    !currentUser.loading && (
                      <React.Fragment>
                        {/*  MOBILE PROFILE BUTTON */}
                        {isSmallDevice && (
                          <IconButton
                            aria-label="Profile"
                            color="primary"
                            component={Link}
                            to="/app/account/profile"
                            size="large"
                            sx={{
                              ...sxHeaderButton,
                              marginLeft: "auto",
                            }}
                          >
                            <AccountCircleIcon
                              sx={{
                                ...sxHeaderButton,
                                color: "primary.main",
                                fontSize: "2.3rem",
                              }}
                            />
                          </IconButton>
                        )}

                        {/*  DESKTOP WELCOME, PROFILE BUTTON, LOGOUT BUTTON */}
                        {!isSmallDevice && (
                          <Fragment>
                            <Box
                              sx={{
                                display: "inline-flex",
                                fontSize: styleVars.txtFontSizeXs,
                                marginRight: 4,
                              }}
                            >
                              Welcome, {nameFirst}
                            </Box>
                            <Button
                              color="primary"
                              component={Link}
                              to="/app/account/profile"
                              sx={{
                                ...sxHeaderButton,
                                ...sxDesktopNavButton,
                              }}
                            >
                              <AccountCircleIcon
                                sx={{
                                  color: "primary.main",
                                  fontSize: styleVars.txtFontSizeXl,
                                  marginRight: 0.85,
                                }}
                              />
                              My Account
                            </Button>
                            <Button
                              color="primary"
                              component={Link}
                              to="/app/account/logout"
                              sx={{
                                ...sxHeaderButton,
                                ...sxDesktopNavButton,
                              }}
                            >
                              <span>Log out</span>
                            </Button>
                          </Fragment>
                        )}
                      </React.Fragment>
                    )
                  )}
                </Box>
              </React.Fragment>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </React.Fragment>
  );
}

const sxHeaderButton = {
  fontFamily: styleVars.txtFontFamilyDefault,
  fontWeight: styleVars.txtFontWeightDefaultNormal,
  color: styleVars.txtColorDefault,
  "&:link": { color: styleVars.txtColor },
  "&:visited": { color: styleVars.txtColor },
};

const sxDesktopNavButton = {
  borderLeft: `1px solid ${styleVars.colorLightGray}`,
  borderRight: `1px solid ${styleVars.colorLightGray}`,
  fontWeight: styleVars.txtFontWeightDefaultNormal,
  height: "47px",
  paddingTop: 1,
  paddingBottom: 1,
  paddingLeft: 4,
  paddingRight: 4,
  textTransform: "none",
};

Header.propTypes = {
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  includingPrimaryMenu: PropTypes.bool,
  togglePrimaryMenuExpandedAtMobileRes: PropTypes.func,
};

export default Header;
