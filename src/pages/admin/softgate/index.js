import React, { Fragment, useCallback, useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { requestResourceSoftGateLogs } from "api/requests";
import generateTitle from "utils/generateTitle";
import { Paper, Table, TableBody, TableHead, TableRow, TableCell } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import HgPagination from "components/ui/HgPagination";
import HgSkeleton from "components/ui/HgSkeleton";
import { useHistory, Link } from "react-router-dom";
import generateQsPrefix from "utils/generateQsPrefix";
import moment from "moment";
import currentUrlParamValue from "utils/currentUrlParamValue";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import populateUseStateFromUrlParams from "utils/populateUseStateFromUrlParams";
import styleVars from "style/_vars.scss";

/**
 * Soft-gate Logs admin page functional component
 */
function SoftGateLogs() {
  const maxMobileWidth = 600;
  const resultsPerPage = 50;
  const actualQsPrefix = generateQsPrefix("admsoft_");
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(
    currentUrlParamValue("page", actualQsPrefix, window.location, 1)
  );
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [softGateLogs, setSoftGateLogs] = useState([]);
  const [softGateLogsTotal, setSoftGateLogsTotal] = useState(0);
  const classes = useStyles();
  const { width, ref } = useResizeDetector();

  const utilDefinitions = useCallback(() => {
    return [
      {
        stateName: "currentPage",
        paramName: "page",
        defaultParamValue: 1,
        valueType: "num",
      },
    ];
  }, []);

  // Mobile view defined by maxMobileWidth
  const isMobileView = () => {
    return width <= maxMobileWidth;
  };

  // Did soft gate request return populated log array
  const hasSoftGateLogs = () => {
    return !isEmpty(softGateLogs) && loaded && !loading;
  };

  // Call setState hook for current page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * jsx loading output with skeleton table cells
   * @param {number} columnNumber
   * @returns {object} jsx
   */
  const loadingOutput = (columnNumber) => {
    let skeletonCells = [];

    for (let i = 0; i < columnNumber; i++) {
      skeletonCells.push(
        <TableCell key={i}>
          <HgSkeleton variant="text" />
        </TableCell>
      );
    }

    return skeletonCells;
  };

  /**
   * jsx "When" cell output
   * @param {string} unformattedTime
   * @param {number} logId
   * @returns {object} jsx
   */
  const whenOutput = (unformattedTime, logId) => {
    return (
      <div>
        <div>{moment.utc(unformattedTime).fromNow()}</div>
        <div className={classes.secondaryText}>id: {logId}</div>
      </div>
    );
  };

  // Request soft gate logs from API
  useEffect(() => {
    setLoading(true);
    requestResourceSoftGateLogs({
      per_page: resultsPerPage,
      page: currentPage,
    }).then((res) => {
      if (200 === res.status) {
        setLoading(false);
        setLoaded(true);
        setSoftGateLogs(res.data.data);
        setSoftGateLogsTotal(res.data.total);
      } else {
        console.error("An error occurred retrieving soft gate logs");
        setLoading(false);
        setLoaded(true);
        setSoftGateLogs([]);
        setSoftGateLogsTotal(0);
      }
    });
  }, [currentPage]);

  // populate url params from current useState hook values
  useEffect(() => {
    populateUrlParamsFromState(
      { currentPage },
      window.location,
      history,
      utilDefinitions(),
      actualQsPrefix
    );
  }, [actualQsPrefix, currentPage, history, utilDefinitions]);

  // Set popState listeners
  useEffect(() => {
    // Popstate listener function
    // calls `setFunction` from useState hooks
    const listenToPopstate = () => {
      populateUseStateFromUrlParams(
        { page: setCurrentPage },
        window.location.search,
        utilDefinitions(),
        actualQsPrefix
      );
    };

    window.addEventListener("popstate", listenToPopstate);
    return () => {
      window.removeEventListener("popstate", listenToPopstate);
    };
  }, [actualQsPrefix, utilDefinitions]);

  // Set title
  useEffect(() => {
    generateTitle(`Soft-gate Logs`);
  }, []);

  return (
    <div ref={ref}>
      <h1>Soft-gate Logs</h1>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              {!isMobileView() && (
                <Fragment>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Resource</TableCell>
                  <TableCell align="right">When</TableCell>
                  <TableCell align="right">Role</TableCell>
                </Fragment>
              )}
              {isMobileView() && (
                <Fragment>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Resource</TableCell>
                </Fragment>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                {isMobileView() && loadingOutput(2)}
                {!isMobileView() && loadingOutput(4)}
              </TableRow>
            )}
            {!loading && (
              <Fragment>
                {!hasSoftGateLogs() && (
                  <TableRow>
                    <TableCell>No Soft-gate Logs Found</TableCell>
                  </TableRow>
                )}
              </Fragment>
            )}
            {hasSoftGateLogs() && (
              <Fragment>
                {!isMobileView() && (
                  <Fragment>
                    {softGateLogs.map((softGateLog) => (
                      <TableRow key={`soft_gate_log_${softGateLog.id}`}>
                        <TableCell className={classes.longTableCell}>
                          <div className={classes.emailTextContainer}>{softGateLog.email}</div>
                        </TableCell>
                        <TableCell align="right">
                          <Link to={`/app/admin/resources/${softGateLog.resource_id}`}>
                            {softGateLog.resource_id}
                          </Link>
                        </TableCell>
                        <TableCell align="right">
                          {whenOutput(softGateLog.created_at, softGateLog.id)}
                        </TableCell>
                        <TableCell align="right">{softGateLog.role}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                )}
                {isMobileView() && (
                  <Fragment>
                    {softGateLogs.map((softGateLog) => (
                      <TableRow key={`soft_gate_log_${softGateLog.id}`}>
                        <TableCell className={classes.longTableCell}>
                          <div className={classes.emailTextContainer}>{softGateLog.email}</div>
                          <div className={classes.secondaryText}>
                            {whenOutput(softGateLog.created_at, softGateLog.id)}
                          </div>
                          <div className={classes.secondaryText}>{softGateLog.role}</div>
                        </TableCell>
                        <TableCell align="right">
                          <Link to={`/app/admin/resources/${softGateLog.resource_id}`}>
                            {softGateLog.resource_id}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                )}
              </Fragment>
            )}
          </TableBody>
        </Table>
        <HgPagination
          handlePageChange={handlePageChange}
          itemsPerPage={resultsPerPage}
          itemsTotal={softGateLogsTotal}
          currentPage={currentPage}
        />
      </Paper>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  emailTextContainer: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  longTableCell: {
    maxWidth: "170px",
  },
  secondaryText: {
    fontSize: styleVars.txtFontSizeXs,
  },
}));

export default SoftGateLogs;
