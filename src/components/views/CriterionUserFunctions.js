import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { isArray } from "lodash";
import { CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestCriterionUserFunctions } from "api/requests";

/**
 * Displays list of UserFunctions associated with a Criterion.
 *
 * Intended as simple, user-facing list typically displayed on
 * on question pages.
 */
class CriterionUserFunctions extends React.Component {
  static propTypes = {
    criterionId: PropTypes.number.isRequired,
    // If UserFunctions are being provided by calling code,
    // assign them to the "callerUserFunctions" prop and
    // this component will use them instead of requesting
    // from the API.
    callerUserFunctions: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loaded: false,
      userFunctions: [],
    };
  }

  componentDidMount() {
    this.loadUserFunctions();
  }

  componentDidUpdate(prevProps) {
    const { callerUserFunctions: prevCallerUserFunctions, criterionId: prevCriterionId } =
      prevProps;
    const { callerUserFunctions, criterionId } = this.props;

    if (prevCriterionId !== criterionId || prevCallerUserFunctions !== callerUserFunctions) {
      this.loadUserFunctions();
    }
  }

  /**
   * Populate state.userFunctions array based on props.criterionId.
   *
   * If callerUserFunctions was provided, we use it.
   */
  loadUserFunctions = () => {
    const { callerUserFunctions, criterionId } = this.props;

    // Use callerUserFunctions prop if available, then
    // skip the rest of this method.
    if (isArray(callerUserFunctions)) {
      this.setState({
        loading: false,
        loaded: true,
        userFunctions: callerUserFunctions,
      });
      return;
    }

    this.setState({ loading: true });

    requestCriterionUserFunctions(criterionId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              loading: false,
              loaded: true,
              userFunctions: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving position records");
        if (!this.isCancelled) {
          this.setState({
            loading: false,
            loaded: true,
            userFunctions: [],
          });
        }
      });
  };

  render() {
    const { loading, loaded, userFunctions } = this.state;

    if (loading || !loaded) {
      // Still loading.
      return <CircularProgress size="1em" />;
    }

    if (!userFunctions || 0 === userFunctions.length) {
      // No userFunctions.
      return null;
    }

    return (
      <ul>
        {userFunctions.map((userFunction) => (
          <li key={userFunction.id}>{userFunction.name}</li>
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
)(withStyles(styles, { withTheme: true })(CriterionUserFunctions));
