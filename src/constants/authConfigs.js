const authConfigs = {
  authSamlEndpointPath: "/api/auth/saml",

  // Cookie/local storage names
  // --------------------------

  // Note: Axios automatically uses "XSRF-TOKEN" regardless
  // of what we declare here.
  csrfTokenCookieName: "XSRF-TOKEN",

  // Stores timestamp of last call to API.
  latestRequestLsKey: "p2lr",

  // Stores timestamp of next-to-last call to API.
  prevLatestRequestLsKey: "p2plr",

  // Stores soft-gate data.
  softGateKey: "p2sgr",

  // Stores post register destination
  registerDest: "p2regdest",

  // Stores announcement bar dismissed
  announcementBarDismissed: "p2_announcement_bar_dismissed",
};

export default authConfigs;
