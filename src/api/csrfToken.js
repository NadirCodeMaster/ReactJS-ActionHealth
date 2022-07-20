import authConfigs from "constants/authConfigs";
import { appCookiesContext } from "appCookiesContext";

export function getCsrfToken() {
  let csrfTokenCookie = appCookiesContext.get(authConfigs.csrfTokenCookieName);
  return csrfTokenCookie;
}

export function removeCsrfToken() {
  appCookiesContext.remove(authConfigs.csrfTokenCookieName);
}
