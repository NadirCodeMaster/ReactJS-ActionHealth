import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import moment from "moment";
import { withStyles } from "@mui/styles";
import PageNotFound from "components/views/PageNotFound";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

class SetReportDownload extends Component {
  static propTypes = {
    format: PropTypes.string,
    organization: PropTypes.shape(organizationShape).isRequired,
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape),
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      report: null,
      reportServed: false,
      reportLoading: false,
      reportError: false,
      accessChecked: false,
      userCanView: false,
    };
  }

  componentDidMount() {
    this.serveReportIfReady();
  }

  componentDidUpdate(prevProps) {
    const { currentUser, organization, set } = this.props;
    const {
      currentUser: prevCurrentUser,
      organization: prevOrganization,
      set: prevSet,
    } = prevProps;

    let reServeReport = false;

    // If we haven't yet loaded the report...
    if (!this.firstRequestMade) {
      reServeReport = true;
    }
    // If the applicable props have changed...
    else if (
      !compareObjectIds(organization, prevOrganization) ||
      !compareObjectIds(set, prevSet) ||
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser)
    ) {
      reServeReport = true;
    }

    if (reServeReport) {
      this.serveReportIfReady();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  // Modify dl format string to a valid value if needed.
  filterDownloadFormat = (format) => {
    let validFormats = ["xls", "csv"];
    let defaultFormat = "xls";

    let formatIndex = validFormats.findIndex((validFormat) => {
      return validFormat === format;
    });
    return formatIndex >= 0 ? format : defaultFormat;
  };

  getReportFileName = () => {
    const { format, organization, set } = this.props;

    // Whitelist format values.
    let okFormat = this.filterDownloadFormat(format);

    let oId = organization ? organization.id : null;
    let sId = set ? set.id : null;

    if (oId && sId) {
      let repDate = moment().format("YYYY-MM-DD");
      return `assessment-${sId}-report-for-${oId}-${repDate}.${okFormat}`;
    }
    return null;
  };

  getReportApiUrl = () => {
    const { format, organization, set } = this.props;

    // Whitelist format values.
    let okFormat = this.filterDownloadFormat(format);

    let oId = organization ? organization.id : null;
    let sId = set ? set.id : null;

    if (oId && sId) {
      let apiBaseUrl = process.env.REACT_APP_API_URL;
      return `${apiBaseUrl}/api/v1/organizations/${oId}/sets/${sId}/report?format=${okFormat}`;
    }
    return null;
  };

  /**
   * Wrapper for _serveReport() that confirms required props are ready to do so.
   *
   * Also performs the access check and sets the associated state props.
   *
   * @returns {Boolean} Whether we called _getReport()
   */
  serveReportIfReady = () => {
    const { currentUser, organization, set } = this.props;

    // Check if props are ready...
    if (
      currentUser &&
      currentUser.loaded &&
      organization &&
      !isNil(organization.id) &&
      set &&
      !isNil(set.id)
    ) {
      // Check if user has access...
      let allow = userCan(currentUser, organization, "view_assessment");

      // Set firstRequestMade here to prevent any overlapping
      // calls from componentDidUpdate() from state setting below.
      if (allow) {
        this.firstRequestMade = true;
      }

      // Set all new state prop values here to minimize refreshes.
      if (!this.isCancelled) {
        this.setState({
          accessChecked: true,
          userCanView: allow,
          reportLoading: allow, // we're about to start if allow is true
          reportError: false,
        });
      }
      // If so, load report.
      if (allow) {
        this._serveReport();
        return true;
      }
    }
    // Props not ready or user doesn't have permission.
    return false;
  };

  /**
   * Load the report file from API and serve to user.
   */
  _serveReport = () => {
    let fileData = this.getReportApiUrl();
    let fileName = this.getReportFileName();
    let headers = new Headers();

    fetch(fileData, { headers, credentials: "include" })
      .then((response) => response.blob())
      .then((blobby) => {
        // For MS browsers
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // for IE
          window.navigator.msSaveOrOpenBlob(blobby, fileName);
          if (!this.isCancelled) {
            this.setState({
              reportLoading: false,
              reportServed: true,
            });
          }
        }
        // For other browsers.
        else {
          let objectUrl = window.URL.createObjectURL(blobby);

          let anchor = document.createElement("a");
          document.body.appendChild(anchor);

          anchor.href = objectUrl;
          anchor.download = fileName;
          anchor.click();
          window.URL.revokeObjectURL(objectUrl);
          if (!this.isCancelled) {
            this.setState({
              reportLoading: false,
              reportServed: true,
            });
          }
        }
      });
  };

  render() {
    const { history } = this.props;
    const { accessChecked, reportLoading, reportServed, userCanView } = this.state;

    if (!accessChecked || reportLoading) {
      return <CircularProgressGlobal />;
    } else {
      if (!userCanView) {
        return <PageNotFound />;
      }
    }

    if (reportServed) {
      history.goBack();
    }

    return <p>Download...</p>;
  }
}

const styles = (theme) => ({});

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(SetReportDownload));
