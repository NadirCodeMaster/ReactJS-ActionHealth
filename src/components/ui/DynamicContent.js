import React, { Component } from "react";
import DraftEditor from "components/ui/DraftEditor";
import PropTypes from "prop-types";
import HgSkeleton from "components/ui/HgSkeleton";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@mui/styles";
import { withRouter } from "react-router";
import { get, isEmpty } from "lodash";

/**
 * Standardized wrapper for DynamicContent
 */
class DynamicContent extends Component {
  static propTypes = {
    machineName: PropTypes.string.isRequired,
  };

  render() {
    const { contents, machineName } = this.props;
    let loadingArray = get(contents, `loading`, []);
    let loading = loadingArray.indexOf(machineName) === -1 ? false : true;
    let contentByMachineName = get(contents, `data.${machineName}`, {});
    let content = get(contentByMachineName, `content`, "");
    let hasContent = !isEmpty(content);

    if (loading) {
      return <HgSkeleton variant="text" />;
    }

    if (hasContent) {
      return (
        <React.Fragment>
          <DraftEditor value={content} readOnly={true} />
        </React.Fragment>
      );
    }

    return null;
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    contents: state.contents,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps)
)(withStyles(styles, { withTheme: true })(DynamicContent));
