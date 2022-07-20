import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "core-js/stable"; // @see https://babeljs.io/docs/en/next/babel-polyfill.html
import "regenerator-runtime/runtime"; // @see https://babeljs.io/docs/en/next/babel-polyfill.html
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { Router } from "react-router-dom";

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";

import { Provider } from "react-redux";
import { appHistory } from "./appHistory";
import muiTheme from "style/muiTheme";

import { CookiesProvider } from "react-cookie";
import appStore from "./store/appStore";

// @see https://mui.com/components/pickers/
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateAdapter from "@mui/lab/AdapterMoment";

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={muiTheme}>
      <Provider store={appStore}>
        <CookiesProvider>
          <Router history={appHistory}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <App />
            </LocalizationProvider>
          </Router>
        </CookiesProvider>
      </Provider>
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById("root")
);
registerServiceWorker();
