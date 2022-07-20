import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import PageNotFound from "components/views/PageNotFound";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import ProgramOrganizationSetRouting from "./ProgramOrganizationSetRouting";
import parseProgramOrganizationData from "utils/parseProgramOrganizationData";
import {
  requestProgramOrganizationInfo,
  requestOrganization,
  requestOrganizationSets,
} from "api/requests";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting
 * with `/app/programs/:program_id/organizations/:organization_id`
 */
class ProgramOrganizationRouting extends React.Component {
  static propTypes = {
    program: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired, // already populated/loaded
    organizationId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired, // via withRouter
    location: PropTypes.object.isRequired, // via withRouter
  };

  constructor(props) {
    super(props);

    // Bound methods so child routes can update data otherwise controlled here.
    // https://reactjs.org/docs/faq-functions.html#bind-in-constructor-es2015
    this.refreshOrgStats = this.triggerRefreshOrgStats.bind(this);

    // Method to call when a response is added/updated so
    // components that need the latest info know to ask for it.
    this.declareResponsesHaveChanged = this.setResponsesHaveChanged.bind(this);

    this.isCancelled = false;

    this.state = {
      organization: null,
      organizationLoading: false,

      orgProgDataLoading: false,
      orgProgData: null,

      orgSetsDataLoading: false,
      orgSetsData: null,

      responsesHaveChanged: false,
      userCanViewAssessment: false,
    };
  }

  /**
   * Modify responsesHaveChanged (usually via call from
   * an external component to declareResponsesHaveChanged,
   * which we bind with this)
   */
  setResponsesHaveChanged = () => {
    if (!this.isCancelled) {
      this.setState({ responsesHaveChanged: true });
    }
  };

  /**
   * Trigger a refresh of the org stat data.
   *
   * Intended for use by other components when they need
   * the latest info, such as after responses change.
   */
  triggerRefreshOrgStats = () => {
    this.populateOrgProgData();
    this.populateOrgSetsData();
    if (!this.isCancelled) {
      this.setState({ responsesHaveChanged: false });
    }
  };

  /**
   * Retrieve the organization record from server, add to state.
   */
  populateOrganizationAndPermissions = () => {
    const { currentUser, organizationId } = this.props;

    this.setState({
      organizationLoading: true,
      userCanViewAssessment: false,
    });

    requestOrganization(organizationId)
      .then((res) => {
        let newUserCanViewAssessment = userCan(currentUser, res.data.data, "view_assessment");
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: res.data.data,
            userCanViewAssessment: newUserCanViewAssessment,
          });
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving the organization.");
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: null,
          });
        }
      });
  };

  /**
   * Retrieve and parse program organization data.
   */
  populateOrgProgData = () => {
    const { program } = this.props;
    const { organization, userCanViewAssessment } = this.state;

    // Exit if no org or access.
    if (!organization || !userCanViewAssessment) {
      this.setState({
        orgProgData: null,
        orgProgDataLoading: false,
      });
      return;
    }

    this.setState({ orgProgDataLoading: true });

    requestProgramOrganizationInfo(program.id, organization.id)
      .then((res) => {
        let parsed = {};
        try {
          parsed = parseProgramOrganizationData(res.data);
        } catch (e) {
          console.error("Error parsing program/organization info", e);
        }

        if (!this.isCancelled) {
          this.setState({
            orgProgDataLoading: false,
            orgProgData: parsed,
          });
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving the program organization data.");
        if (!this.isCancelled) {
          this.setState({
            orgProgDataLoading: false,
            orgProgData: {},
          });
        }
      });
  };

  /**
   * Retrieve organization sets data.
   */
  populateOrgSetsData = () => {
    const { program } = this.props;
    const { organization, userCanViewAssessment } = this.state;

    // Exit if no org or access.
    if (!organization || !userCanViewAssessment) {
      this.setState({
        orgSetsData: null,
        orgSetsDataLoading: false,
      });
      return;
    }

    this.setState({ orgSetsDataLoading: true });

    requestOrganizationSets(organization.id, {
      program_id: program.id,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            orgSetsDataLoading: false,
            orgSetsData: res.data.data,
          });
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving the organization sets data.");
        if (!this.isCancelled) {
          this.setState({
            orgSetsDataLoading: false,
            orgSetsData: null,
          });
        }
      });
  };

  componentDidMount() {
    // Retrieve organization object here and run other setups
    // that don't require a populated org object (just the ID).
    // Remaining set up, including perm check, is done in
    // componentDidUpdate() after the org is loaded into state.
    this.populateOrganizationAndPermissions();
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, organizationId, program } = this.props;
    const {
      currentUser: prevCurrentUser,
      organizationId: prevOrganizationId,
      program: prevProgram,
    } = prevProps;
    const { organization } = this.state;
    const { organization: prevOrganization } = prevState;

    // Repopulate org, perms when organizationId or currentUser props change.
    if (
      organizationId !== prevOrganizationId ||
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser)
    ) {
      this.populateOrganizationAndPermissions();
    }

    // When organization is populated/changed, or if program prop
    // changes, retrieve the prog/set data.
    // (access checking is done and applied to state.userCanViewAssessment
    // when populating organization in populateOrganizationAndPermissions,
    // so userCanViewAssessment will be in sync with actual org object here.
    if (!compareObjectIds(organization, prevOrganization) || program.id !== prevProgram.id) {
      this.populateOrgProgData();
      this.populateOrgSetsData();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { program, currentUser } = this.props;
    const {
      organization,
      organizationLoading,
      orgProgDataLoading,
      orgProgData,
      orgSetsDataLoading,
      orgSetsData,
      responsesHaveChanged,
    } = this.state;

    if (!currentUser || !currentUser.isAuthenticated) {
      // Org might not be eligible for program or user
      // may not have access.
      return <PageNotFound />;
    }

    if (currentUser.loading || organizationLoading || orgProgDataLoading || orgSetsDataLoading) {
      return <CircularProgressGlobal />;
    }

    if (isNil(organization) || isNil(orgProgData) || isNil(orgSetsData)) {
      return null;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* Redirect from legacy prog/org route to new org dashboard. */}
          <Redirect
            exact
            from="/app/programs/:program_id/organizations/:organization_id"
            to="/app/account/organizations/:organization_id"
          />

          {/* Redirect from legacy prog/org/sets route to new org sets route. */}
          <Redirect
            exact
            from="/app/programs/:program_id/organizations/:organization_id/sets"
            to="/app/account/organizations/:organization_id/sets"
          />

          {/* ALL PROGRAM/ORGANIZATION/SET SPECIFIC ROUTES */}
          <Route
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id"
            render={({ match }) => (
              <ProgramOrganizationSetRouting
                currentUser={currentUser}
                program={program}
                organization={organization}
                orgProgData={orgProgData}
                orgSetsData={orgSetsData}
                setId={Number(match.params.set_id)}
                refreshOrgStats={this.refreshOrgStats}
                declareResponsesHaveChanged={this.declareResponsesHaveChanged}
                responsesHaveChanged={!isNil(responsesHaveChanged) ? responsesHaveChanged : false}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ProgramOrganizationRouting);
