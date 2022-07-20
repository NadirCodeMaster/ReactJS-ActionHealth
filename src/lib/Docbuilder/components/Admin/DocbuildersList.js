import React, { Fragment, useCallback, useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { requestDocbuilders } from "../../requests";
import generateTitle from "utils/generateTitle";
import {
  Button,
  Icon,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import HgPagination from "components/ui/HgPagination";
import HgSkeleton from "components/ui/HgSkeleton";
import { useHistory, Link } from "react-router-dom";
import generateQsPrefix from "utils/generateQsPrefix";
import currentUrlParamValue from "utils/currentUrlParamValue";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import usePopState from "hooks/usePopState";
import styleVars from "style/_vars.scss";

/**
 * Docbuilders admin page functional component
 */
export default function Docbuilders() {
  const resultsPerPage = 10;
  const actualQsPrefix = generateQsPrefix("admdoc_");
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(
    currentUrlParamValue("page", actualQsPrefix, window.location, 1)
  );
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [docbuilders, setDocbuilders] = useState([]);
  const [docbuildersTotal, setDocbuildersTotal] = useState(0);
  const classes = useStyles();
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
  const setFunctions = { page: setCurrentPage };

  // Did docbuilders request return populated log array
  const hasDocbuilders = () => {
    return !isEmpty(docbuilders) && loaded && !loading;
  };

  // Call setState hook for current page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Request docbuilders from API
  useEffect(() => {
    setLoading(true);
    requestDocbuilders({
      per_page: resultsPerPage,
      page: currentPage,
    }).then((res) => {
      if (200 === res.status) {
        setDocbuilders(res.data.data);
        setDocbuildersTotal(res.data.meta.total);
        setLoading(false);
        setLoaded(true);
      } else {
        console.error("An error occurred retrieving docbuilders");
        setDocbuilders([]);
        setDocbuildersTotal(0);
        setLoading(false);
        setLoaded(true);
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

  // Setup popstate functionality
  usePopState(actualQsPrefix, setFunctions, utilDefinitions);

  // Set title
  useEffect(() => {
    generateTitle(`Docbuilders`);
  }, []);

  return (
    <div>
      <h1>
        Docbuilders
        <Button
          color="primary"
          component={Link}
          size="small"
          className={classes.addButton}
          to={`/app/admin/docbuilders/new`}
        >
          <Icon color="primary" style={{ marginRight: "4px" }}>
            add_circle
          </Icon>
          Add
        </Button>
      </h1>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
              </TableRow>
            )}
            {!loading && loaded && (
              <Fragment>
                {!hasDocbuilders() && (
                  <TableRow>
                    <TableCell colSpan={2}>No Docbuilders Found</TableCell>
                  </TableRow>
                )}
              </Fragment>
            )}
            {hasDocbuilders() && (
              <Fragment>
                {docbuilders.map((docbuilder) => (
                  <TableRow key={`docbuilder_${docbuilder.id}`}>
                    <TableCell className={classes.longTableCell}>
                      <Link to={`/app/admin/docbuilders/${docbuilder.id}`}>{docbuilder.name}</Link>
                      <div className={classes.secondaryText}>{docbuilder.machine_name}</div>
                      <div className={classes.secondaryText}>{docbuilder.slug}</div>
                      {docbuilder.public && <div className={classes.secondaryText}>Published</div>}
                    </TableCell>
                    <TableCell align="right">
                      <Link to={`/app/admin/docbuilders/${docbuilder.id}`}>{docbuilder.id}</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            )}
          </TableBody>
        </Table>
        <HgPagination
          handlePageChange={handlePageChange}
          itemsPerPage={resultsPerPage}
          itemsTotal={docbuildersTotal}
          currentPage={currentPage}
        />
      </Paper>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  addButton: {
    marginLeft: "4px",
    minWidth: "auto",
  },
  secondaryText: {
    fontSize: styleVars.txtFontSizeXs,
  },
}));
