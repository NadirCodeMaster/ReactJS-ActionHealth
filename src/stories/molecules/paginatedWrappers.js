import React, { Fragment } from "react";
import * as demoStyles from "../_support/demoStyles";
import HgPagination from "components/ui/HgPagination";
import { Router } from "react-router";
import { createMemoryHistory } from "history";

export default {
  title: "Molecules/Paginated Wrapper",
};

export const Pagination = () => {
  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <Router history={history}>
        <HgPagination
          handlePageChange={() => {}}
          itemsPerPage={1}
          itemsTotal={10}
          currentPage={1}
        />
      </Router>
    </Fragment>
  );
};

const history = createMemoryHistory();

const disclaimer = (
  <React.Fragment>
    <p>Below is our pagination. Normally these would go under a table, within a paper element.</p>
  </React.Fragment>
);
