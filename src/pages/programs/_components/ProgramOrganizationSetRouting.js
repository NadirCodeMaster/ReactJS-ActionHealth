import React from "react";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Redirect, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import PrivateRoute from "components/ui/PrivateRoute";
import PageOrganizationSet from "../organizations/sets/detail";
import PageOrganizationSetReport from "../organizations/sets/report/index";
import PageOrganizationSetGlossary from "../organizations/sets/glossary/index";
import PageOrganizationSetReportDownload from "../organizations/sets/report/download";
import PageOrganizationSetModule from "../organizations/sets/modules/detail";
import PageOrganizationSetModuleResource from "../organizations/sets/modules/resources";
import PageOrganizationSetQuestion from "../organizations/sets/questions/index";
import { requestSet } from "api/requests";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with
 * `/app/programs/:program_id/organizations/:organization_id/sets/:set_id`
 *
 * See propTypes for required props.
 */
class ProgramOrganizationSetRouting extends React.Component {
  static propTypes = {
    program: PropTypes.object.isRequired, // already populated/loaded
    organization: PropTypes.shape(organizationShape).isRequired, // already populated/loaded
    setId: PropTypes.number.isRequired,
    orgProgData: PropTypes.object.isRequired,
    orgSetsData: PropTypes.array.isRequired,
    // Used to refresh the org{Whatev}Data objects
    // managed in ProgramOrganizationRouting.
    refreshOrgStats: PropTypes.func,
    // Whether responses have changed since last stat refresh.
    responsesHaveChanged: PropTypes.bool,
    // Method to call when a response is added/updated so
    // components that need the latest info know to ask for it
    // (they'll ask for it by calling refreshOrgStats).
    declareResponsesHaveChanged: PropTypes.func,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired, // via withRouter
  };

  constructor(props) {
    super(props);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      set: null,
      setLoading: false,
      setError: false,
    };
  }

  /**
   * Retrieve the set record from server, add to component state.
   */
  getSet = () => {
    const { setId } = this.props;

    this.setState({ setLoading: true });

    requestSet(setId)
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            setLoading: false,
            set: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            setLoading: false,
            setError: false,
            set: {},
          });
          console.error("An error occurred retrieving the set.");
        }
      });
  };

  componentDidMount() {
    const { setId } = this.props;
    this.getSet(setId);
  }

  componentDidUpdate(prevProps) {
    const { setId } = this.props;
    const { setId: prevSetId } = prevProps;

    if (prevSetId !== setId) {
      this.getSet(setId);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const {
      currentUser,
      declareResponsesHaveChanged,
      location,
      organization,
      orgProgData,
      orgSetsData,
      program,
      refreshOrgStats,
      responsesHaveChanged,
    } = this.props;
    const { set, setLoading } = this.state;

    if (isNil(set) || setLoading) {
      return <CircularProgressGlobal />;
    }

    // Note that we pass location.pathname as the key prop on the
    // wrapper element below so history.push() requests by the various
    // components are honored.

    return (
      <React.Fragment key={location.pathname}>
        <Switch>
          <PrivateRoute
            exact
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSet
                set={set}
                program={program}
                organization={organization}
                orgProgData={orgProgData}
                orgSetsData={orgSetsData}
                refreshOrgStats={refreshOrgStats}
                responsesHaveChanged={!isNil(responsesHaveChanged) ? responsesHaveChanged : false}
              />
            )}
          />
          <PrivateRoute
            exact
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/report"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSetReport
                set={set}
                program={program}
                organization={organization}
                orgProgData={orgProgData}
                responsesHaveChanged={!isNil(responsesHaveChanged) ? responsesHaveChanged : false}
              />
            )}
          />

          <PrivateRoute
            exact
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/glossary"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSetGlossary
                set={set}
                program={program}
                organization={organization}
              />
            )}
          />

          <PrivateRoute
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/report/download/:format"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSetReportDownload
                format={match.params.format}
                set={set}
                program={program}
                organization={organization}
                responsesHaveChanged={!isNil(responsesHaveChanged) ? responsesHaveChanged : false}
              />
            )}
          />

          <PrivateRoute
            exact
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/modules/:module_id/resources"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSetModuleResource
                set={set}
                program={program}
                organization={organization}
                orgSetsData={orgSetsData}
                moduleId={Number(match.params.module_id)}
              />
            )}
          />

          <PrivateRoute
            exact
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/modules/:module_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSetModule
                set={set}
                program={program}
                organization={organization}
                orgProgData={orgProgData}
                orgSetsData={orgSetsData}
                moduleId={Number(match.params.module_id)}
                refreshOrgStats={refreshOrgStats}
                responsesHaveChanged={!isNil(responsesHaveChanged) ? responsesHaveChanged : false}
              />
            )}
          />
          <Redirect
            exact
            from="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/modules"
            to="/app/programs/:program_id/organizations/:organization_id/sets/:set_id"
          />

          <PrivateRoute
            exact
            path="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/questions/:criterion_instance_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationSetQuestion
                set={set}
                program={program}
                organization={organization}
                orgProgData={orgProgData}
                orgSetsData={orgSetsData}
                criterionInstanceId={Number(match.params.criterion_instance_id)}
                declareResponsesHaveChanged={declareResponsesHaveChanged}
              />
            )}
          />

          <Redirect
            exact
            from="/app/programs/:program_id/organizations/:organization_id/sets/:set_id/questions"
            to="/app/programs/:program_id/organizations/:organization_id/sets/:set_id"
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default compose(withRouter)(ProgramOrganizationSetRouting);
