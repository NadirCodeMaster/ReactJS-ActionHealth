import { useEffect } from "react";
import populateUseStateFromUrlParams from "utils/populateUseStateFromUrlParams";

/**
 * Adds and removes pop state event listener using url parameters
 * Allows user to use forward and back buttons when url params (like
 * currentPage) change.
 *
 * EX: User changes paginated table from first to second page, then hits back
 *     button.  User will be navigated to first page, instead of the previous
 *     root url path (path minus parameters).
 *
 * @param {string} actualQsPrefix
 * @param {object} setFunctions
 *        EX: { page: setCurrentPage, type: setCurrentType}
 * @param {function} utilDefinitions
 */
export default function usePopState(actualQsPrefix, setFunctions, utilDefinitions) {
  // Set popState listeners
  useEffect(() => {
    // Popstate listener function
    // calls `setFunction` from useState hooks
    const listenToPopstate = () => {
      populateUseStateFromUrlParams(
        setFunctions,
        window.location.search,
        utilDefinitions(),
        actualQsPrefix
      );
    };

    window.addEventListener("popstate", listenToPopstate);
    return () => {
      window.removeEventListener("popstate", listenToPopstate);
    };
  });
}
