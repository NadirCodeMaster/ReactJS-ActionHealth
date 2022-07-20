import React from "react";
import ReactGA from "react-ga";
import { useLocation } from "react-router-dom";

const GA_ID_DEV = "UA-1774934-12";
const GA_ID_PROD = "UA-1774934-1";

//
// Custom hook for utilizing react-ga.
// -----------------------------------
// Be sure the component using this are within a <Router>.
//
// Adapted from
// https://raptis.wtf/blog/custom-hook-to-connect-google-analytics-in-react/
//

function useGoogleAnalytics() {
  const location = useLocation();

  React.useEffect(() => {
    _init();
  }, []);

  React.useEffect(() => {
    // String to log. Ex: "/app/account/dashboard?something=yep"
    const toSend = location.pathname + location.search;
    ReactGA.pageview(toSend);
  }, [location]);
}

/**
 * Wrapper for ReactGA initializer to factor in environment.
 */
function _init() {
  // Enable debug mode on the local development environment
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  if (isDev) {
    ReactGA.initialize(GA_ID_DEV, { debug: false });
    return;
  }
  ReactGA.initialize(GA_ID_PROD, { debug: false });
}

export default useGoogleAnalytics;
