import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Pagination } from "@mui/material";
import ScrollToTop from "components/views/ScrollToTop";
import isNumeric from "utils/isNumeric";

//
// Pagination component for use on tables and flexbox grids
//

function HgPagination({
  currentPage, // 1-based page num requested by caller, typically from URL params
  handlePageChange, // function that accepts page num to navigate to
  itemsPerPage, // max number of results to show per page
  itemsTotal, // total number of result items
  scrollToTopOnPageChange, // whether to scroll to top when page changes
  hideIfOnePage, // if true, returns null if less than two pages
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Total number of pages.
  const [pagesTotal, setPagesTotal] = useState(0);

  // Whether to render anything at all.
  const [hide, setHide] = useState(true);

  // Adjust hide and pagesTotal as needed.
  useEffect(() => {
    let newPagesTotal = 0;
    if (isNumeric(itemsTotal) && isNumeric(itemsPerPage)) {
      newPagesTotal = Math.ceil(Number(itemsTotal) / Number(itemsPerPage));
    }
    if (mounted.current) {
      setPagesTotal(newPagesTotal);
      setHide(Boolean(hideIfOnePage && newPagesTotal < 2));
    }
  }, [hideIfOnePage, itemsPerPage, itemsTotal]);

  // --
  // Change page when requested. Calls func provided by calling code.
  const handleOnChange = (event, page) => {
    handlePageChange(page);
  };

  return (
    <Fragment>
      {!hide && (
        <ScrollToTop bypass={!scrollToTopOnPageChange}>
          <Pagination
            count={pagesTotal}
            page={currentPage || 1}
            onChange={handleOnChange}
            sx={{
              ul: {
                justifyContent: "center",
              },
            }}
          />
        </ScrollToTop>
      )}
    </Fragment>
  );
}

HgPagination.defaultProps = {
  currentPage: 1,
  hideIfOnePage: true,
  scrollToTopOnPageChange: true,
};

HgPagination.propTypes = {
  currentPage: PropTypes.number,
  handlePageChange: PropTypes.func.isRequired,
  hideIfOnePage: PropTypes.bool,
  itemsPerPage: PropTypes.number.isRequired,
  itemsTotal: PropTypes.number.isRequired,
  scrollToTopOnPageChange: PropTypes.bool,
};

export default HgPagination;
