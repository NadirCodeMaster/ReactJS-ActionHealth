import React, { useRef, useState, useCallback, useEffect } from "react";
import { usePrevious } from "state-hooks";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { get, has, isObject, isString } from "lodash";
import { Box, CircularProgress } from "@mui/material";
import { requestCsrfCookie, requestCreateUserActivity } from "api/requests";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Routes from "pages/Routes";

// Components
import Footer from "components/layout/Footer";
import Header from "components/layout/Header";
import PrimaryMenu from "components/layout/PrimaryMenu";
import AlertBanner from "components/ui/AlertBanner";

// Actions
import {
  fetchAppMeta,
  fetchContents,
  fetchPrograms,
  initializeCurrentUserData,
} from "store/actions";

// Style stuff
import styleVars from "style/_vars.scss";
import "style/App.scss";

//
// App.js
//

function App() {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentLocation = useLocation();
  const dispatch = useDispatch();

  // Redux data.
  const appMeta = useSelector((state) => state.app_meta);
  const contents = useSelector((state) => state.contents);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const programs = useSelector((state) => state.programs);

  // Redux loading state values.
  const [loadingAppMeta, setLoadingAppMeta] = useState(true);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Other state values.

  // -- activeOrgId:
  //    ID of organization from current URL location, if any. This is
  //    specifically for paths like /app/account/organizations/*[/...]
  //    and /app/programs/*/organizations/*[/...] where the active
  //    org informs child pages.
  const [activeOrgId, setActiveOrgId] = useState(null);

  // -- allowingWideContent:
  //    When true, max width on the <main> element is removed, allowing
  //    whatever is inside to be as wide as it wants, including overflowing
  //    horizontally beyond the width of the browser if needed.
  const [allowingWideContent, setAllowingWideContent] = useState(false);

  // -- primaryMenuExpandedAtMobileRes:
  //    When true and screen is at a mobile resolution, the primary menu
  //    drawer is open. Not applicable above mobile resolution.
  const [primaryMenuExpandedAtMobileRes, setPrimaryMenuExpandedAtMobileRes] = useState(false);

  // -- includingPrimaryMenu:
  //    When true, the primary menu is rendered in the DOM (though
  //    still potententially hidden/collapsed). Is set to false for
  //    pages like login where navigation isn't applicable.
  const [includingPrimaryMenu, setIncludingPrimaryMenu] = useState(true);

  // -- showingSitewideAlert:
  //    Whether the sitewide alert banner is to be visible.
  const [showingSitewideAlert, setShowingSitewideAlert] = useState(false);

  // -- stillLoadingReqs:
  //    Whether we're still getting the basic data we need for bootstrapping
  //    the Action Center.
  const [stillLoadingReqs, setStillLoadingReqs] = useState(true);

  // Previous values.
  const prevCurrentUser = usePrevious(currentUser);
  const prevCurrentLocation = usePrevious(currentLocation);

  // --
  // Adjust value of includingPrimaryMenu based on a pathname string.
  const adjustIncludingPrimaryMenuForPath = (path) => {
    let newIncludingPrimaryMenu = true;
    if (isString(path) && path.match(/^\/app\/account\/login\/*$/gi)) {
      newIncludingPrimaryMenu = false;
    }
    setIncludingPrimaryMenu(newIncludingPrimaryMenu);
  };

  // --
  // Reverse current value of primaryMenuExpandedAtMobileRes.
  const togglePrimaryMenuExpandedAtMobileRes = useCallback(() => {
    setPrimaryMenuExpandedAtMobileRes(!primaryMenuExpandedAtMobileRes);
  }, [primaryMenuExpandedAtMobileRes]);

  // --
  // Adjust value of allowingWideContent based on a pathname string.
  const adjustAllowingWideContentForPath = (path) => {
    let newAllowingWideContent = false;
    if (isString(path) && path.match(/^\/app\/account\/organizations\/(\d)+\/plan(\/)*$/gi)) {
      newAllowingWideContent = true;
    }
    setAllowingWideContent(newAllowingWideContent);
  };

  // --
  // Logs location changes for authenticated users.
  useEffect(() => {
    // Only do this on production.
    let isProd = process.env.NODE_ENV && "production" === process.env.NODE_ENV;

    // Log activity first time currentUser shows as logged-in (to capture
    // the path on a cold load), and whenever the location path changes
    // after that.
    if (currentUser && currentUser.isAuthenticated) {
      if (
        (prevCurrentUser && !prevCurrentUser.isAuthenticated) ||
        currentLocation.pathname !== prevCurrentLocation.pathname
      ) {
        // Only in production!
        if (isProd) {
          requestCreateUserActivity(currentLocation.pathname);
        }
      }
    }
  }, [currentLocation, currentUser, prevCurrentLocation, prevCurrentUser]);

  // --
  // Retrieve the fundamental data required for the system.
  useEffect(() => {
    // Request CSRF token MUST be set by API before other
    // API calls are made. So, we call to have the token
    // set here and wait to make the other calls until the
    // that request is complete.
    //
    // API sets the CSRF token as a cookie and will automatically
    // refresh it as needed. We don't need to capture the value
    // or do anything besides make the initial request.
    requestCsrfCookie().then((res) => {
      dispatch(fetchPrograms());
      dispatch(fetchAppMeta());
      dispatch(initializeCurrentUserData());
      dispatch(
        fetchContents({
          machine_name: "sitewide_alert",
        })
      );
    });
  }, [dispatch]);

  // --
  // Adjust loading state of appMeta.
  useEffect(() => {
    let newLoadingAppMeta = !isObject(appMeta) || !get(appMeta, "loaded", false);
    setLoadingAppMeta(newLoadingAppMeta);
  }, [appMeta]);

  // --
  // Adjust loading state of currentUser.
  useEffect(() => {
    // Unlike the other redux values we evaluate, we actually want to know if the
    // current user is "bootrapped".
    let cu = currentUser;
    let newLoadingCurrentUser = !isObject(cu) || !get(cu, "bootstrapped", false);
    setLoadingCurrentUser(newLoadingCurrentUser);
  }, [currentUser]);

  // --
  // Adjust loading state of programs.
  useEffect(() => {
    let newLoadingPrograms = !isObject(programs) || !get(programs, "loaded", false);
    setLoadingPrograms(newLoadingPrograms);
  }, [programs]);

  // --
  // Establish if we're still loading the minimum required data.
  useEffect(() => {
    let newStillLoadingReqs = loadingCurrentUser || loadingAppMeta || loadingPrograms;
    setStillLoadingReqs(newStillLoadingReqs);
  }, [loadingCurrentUser, loadingAppMeta, loadingPrograms]);

  // --
  // Respond to changes in location.
  useEffect(() => {
    let cl = currentLocation;
    let pathname = isObject(cl) ? get(cl, "pathname", null) : null;

    if (pathname) {
      // Adjust active org as needed.
      let newActiveOrgId = null;
      let orgPathMatch = pathname.match(/\/organizations\/([0-9]+)/);
      if (orgPathMatch) {
        newActiveOrgId = parseInt(orgPathMatch[1], 10);
      }
      setActiveOrgId(newActiveOrgId);

      // Adjust includingPrimaryMenu as needed.
      adjustIncludingPrimaryMenuForPath(pathname);

      // Account for side content as needed.
      adjustAllowingWideContentForPath(pathname);
    }
  }, [currentLocation]);

  // --
  // Establish whether we should show the sitewide alert.
  useEffect(() => {
    // Whether we do depends only on if it's published or not.
    let newShowingSitewideAlert = get(contents.data, `sitewide_alert.published`, false);
    setShowingSitewideAlert(newShowingSitewideAlert);
  }, [contents]);

  return (
    <div className="app">
      <Box>
        {stillLoadingReqs && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress color="primary" size={40} />
          </Box>
        )}

        {!stillLoadingReqs && (
          <React.Fragment>
            <Header
              togglePrimaryMenuExpandedAtMobileRes={togglePrimaryMenuExpandedAtMobileRes}
              currentUser={currentUser}
              includingPrimaryMenu={includingPrimaryMenu}
            />
            <div className="app-body">
              {includingPrimaryMenu &&
                !loadingAppMeta &&
                has(appMeta, "data.organizationTypes") && (
                  <PrimaryMenu
                    expandedAtMobileRes={primaryMenuExpandedAtMobileRes}
                    toggleDrawer={togglePrimaryMenuExpandedAtMobileRes}
                    currentUser={currentUser}
                    activeOrgId={activeOrgId}
                    currentPath={currentLocation.pathname}
                    organizationTypes={appMeta.data.organizationTypes}
                  />
                )}

              {/* === CONTENT AREA === */}
              <Box
                sx={(theme) => ({
                  // NOTE: This element is responsible for all
                  // content area scrolling above the 'md' breakpoint.
                  bgcolor: "background.default",
                  height: {
                    md: "100vh",
                  },
                  maxHeight: {
                    md: "100vh",
                  },
                  minHeight: "100vh",
                  overflowX: {
                    xs: "hidden",
                    md: allowingWideContent ? "scroll" : "hidden",
                  },
                  overflowY: {
                    md: "scroll",
                  },
                  marginLeft: {
                    md: includingPrimaryMenu ? styleVars.siteSidebarMenuWidth : null,
                  },
                  paddingLeft: 3,
                  paddingRight: 3,
                  paddingTop: 10,
                  position: "relative",
                  "@media print": {
                    height: allowingWideContent ? "auto !important" : null,
                    overflow: allowingWideContent ? "auto !important" : null,
                  },
                })}
              >
                {/* === MAIN === */}
                <Box
                  component="main"
                  sx={{
                    // Remove auto-centering if left nav is present.
                    marginLeft: includingPrimaryMenu ? 0 : "auto",
                    marginRight: includingPrimaryMenu ? 0 : "auto",
                    maxWidth: styleVars.siteMainMaxWidth,
                    minHeight: {
                      xs: "100px",
                      // for sm, just enough to push footer out of view during loads
                      sm: "300px",
                    },
                    width: "100%",
                  }}
                >
                  {/* === ALERT BANNER === */}
                  {showingSitewideAlert && <AlertBanner />}

                  {/* === ROUTING === */}
                  <Routes currentUser={currentUser} programs={programs} />
                </Box>

                {/* === FOOTER === */}
                <Box
                  sx={{
                    // Remove auto-centering if left nav is present.
                    marginLeft: includingPrimaryMenu ? 0 : "auto",
                    marginRight: includingPrimaryMenu ? 0 : "auto",
                    marginTop: 2,
                    maxWidth: styleVars.siteMainMaxWidth,
                    right: 0,
                    textAlign: "left",
                  }}
                >
                  <Footer />
                </Box>
              </Box>
            </div>
          </React.Fragment>
        )}

        {/* Use utils/hgToast to trigger toast notifications */}
        <ToastContainer limit={3} />
      </Box>
    </div>
  );
}

export default App;
