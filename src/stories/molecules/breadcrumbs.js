import React from "react";
import { Router } from "react-router";
import { createMemoryHistory } from "history";
import Breadcrumbs from "../../lib/ui/Breadcrumbs";
import Breadcrumb from "../../lib/ui/Breadcrumb";

// Dummy history object so we can use Router, which Breadcrumb needs.
const history = createMemoryHistory();

export default {
  title: "Atoms/Breadcrumbs",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const BreadcrumbsDemo = () => (
  <Router history={history}>
    <Breadcrumbs>
      <Breadcrumb path="/" root>
        Top-level page
      </Breadcrumb>
      <Breadcrumb path="/">Second-level page</Breadcrumb>
      <Breadcrumb path="/">Third-level page that has a really long name</Breadcrumb>
      <Breadcrumb path="/">Fourth-level page</Breadcrumb>
    </Breadcrumbs>
  </Router>
);
BreadcrumbsDemo.storyName = "Breadcrumbs";
