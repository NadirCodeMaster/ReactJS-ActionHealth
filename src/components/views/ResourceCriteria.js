import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { isArray } from "lodash";
import { CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestResourceCriteria } from "api/requests";

/**
 * Displays list of Criteria associated with a Resource.
 *
 * Intended as simple list.
 */
class ResourceCriteria extends React.Component {
  static propTypes = {
    resourceId: PropTypes.number.isRequired,
    // If criteria are being provided by calling code,
    // assign them to the "callerCriteria" prop and
    // this component will use them instead of requesting
    // from the API.
    callerCriteria: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loaded: false,
      criteria: [],
    };
  }

  componentDidMount() {
    this.loadCriteria();
  }

  componentDidUpdate(prevProps) {
    const { callerCriteria: prevCallerCriteria, resourceId: prevResourceId } = prevProps;
    const { callerCriteria, resourceId } = this.props;

    if (prevResourceId !== resourceId || prevCallerCriteria !== callerCriteria) {
      this.loadCriteria();
    }
  }

  /**
   * Populate state.criteria array based on props.resourceId.
   *
   * If callerCesources was provided, we use it.
   */
  loadCriteria = () => {
    const { callerCriteria, resourceId } = this.props;

    // Use callerCriteria prop if available, then
    // skip the rest of this method.
    if (isArray(callerCriteria)) {
      this.setState({
        loading: false,
        loaded: true,
        criteria: callerCriteria,
      });
      return;
    }

    this.setState({ loading: true });

    requestResourceCriteria(resourceId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              loading: false,
              loaded: true,
              criteria: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving resource records");
        if (!this.isCancelled) {
          this.setState({
            loading: false,
            loaded: true,
            criteria: [],
          });
        }
      });
  };

  render() {
    const { loading, loaded, criteria } = this.state;

    if (loading || !loaded) {
      // Still loading.
      return <CircularProgress size="1em" />;
    }

    if (!criteria || 0 === criteria.length) {
      // No criteria.
      return null;
    }

    return (
      <ul>
        {criteria.map((criterion) => (
          <li key={criterion.id}>
            <Link to={`/app/admin/criteria/${criterion.id}`}>{criterion.name}</Link>
          </li>
        ))}
      </ul>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ResourceCriteria));
