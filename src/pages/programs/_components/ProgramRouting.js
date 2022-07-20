import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import { withStyles } from "@mui/styles";
import PropTypes from "prop-types";
import ProgramOrganizationRouting from "./ProgramOrganizationRouting";
import programBranding from "utils/programBranding";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/programs/:program_id`
 *
 * See propTypes for required props.
 */
class ProgramRouting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programBrandingOutput: null,
    };
  }

  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired,
    program: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.initComponent();
  }

  componentDidUpdate(prevProps, prevState) {
    const { program } = this.props;
    const { program: prevProgram } = prevProps;
    if (program !== prevProgram) {
      this.initComponent();
    }
  }

  initComponent() {
    const { program } = this.props;

    let newPbo = null;
    if (program && program.machine_name) {
      newPbo = programBranding(program.machine_name);
    }

    this.setState({
      programBrandingOutput: newPbo,
    });
  }

  render() {
    const { classes, program, currentUser } = this.props;
    const { programBrandingOutput } = this.state;

    return (
      <React.Fragment>
        <Switch>
          {/* PROGRAM DETAIL ROUTE
              This was previously a "program detail" page, but there's nothing
              unique on that page, so we're just going to forward the user
              on to the programs index.
              */}
          <Redirect exact from="/app/programs/:program_id" to="/app/programs" />

          {/* OLD PROGRAM REGISTRATION PATHS
              Initial build of P2 routed organization registrations through
              a program-specific registration process. We're redirecting all
              of those routes to the new registration */}
          <Redirect
            from="/app/programs/:program_id/register"
            to="/app/account/organizations/join"
          />

          {/* PROGRAM/ORGANIZATIONS INDEX ROUTE
              This was previously a list of Organizations eligible or "enrolled"
              in a program. Now we just redirect to the corresponding
              programs detail route. As of this writing, that route is
              also a redirect to the programs index. */}
          <Redirect
            exact
            from="/app/programs/:program_id/organizations"
            to="/app/programs/:program_id"
          />

          {/* ALL PROGRAM/ORGANIZATION SPECIFIC ROUTES */}
          <Route
            path="/app/programs/:program_id/organizations/:organization_id"
            currentUser={currentUser}
            render={({ match }) => (
              <ProgramOrganizationRouting
                currentUser={currentUser}
                organizationId={Number(match.params.organization_id)}
                program={program}
              />
            )}
          />
        </Switch>

        {programBrandingOutput && (
          <div className={classes.programBrandingWrapper}>{programBrandingOutput}</div>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  programBrandingWrapper: {
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, { withTheme: true })
)(ProgramRouting);
