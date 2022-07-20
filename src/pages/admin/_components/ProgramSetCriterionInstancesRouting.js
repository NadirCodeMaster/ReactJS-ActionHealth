import React from "react";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import { find, isNil } from "lodash";
import PropTypes from "prop-types";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import AdminRoute from "components/ui/AdminRoute";
import PageCriterionInstances from "../programs/sets/questions/index.js";
import PageCriterionInstance from "../programs/sets/questions/detail.js";
import PageCriterionInstanceNew from "../programs/sets/questions/new.js";
import { requestSetCriterionInstances, requestSetModules } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with
 * `/app/admin/programs/:program_id/sets/:set_id/questions`
 *
 * See propTypes for required props.
 */
class ProgramSetCriterionInstancesRouting extends React.Component {
  static propTypes = {
    program: PropTypes.object.isRequired,
    setId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // Bound methods so child routes can update data otherwise controlled here.
    // https://reactjs.org/docs/faq-functions.html#bind-in-constructor-es2015
    this.refreshSetCriterionInstances = this.getSetCriterionInstances.bind(this);

    // Method to call when CIs are added/updated so
    // components that need the latest info know to ask for it.
    this.declareSetCriterionInstancesHaveChanged =
      this.setSetCriterionInstancesHaveChanged.bind(this);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      set: null,
      setCriterionInstancesLoading: false,
      setCriterionInstancesError: false,
      setCriterionInstances: null,
      setCriterionInstancesHaveChanged: false,
      setModulesLoading: false,
      setModulesError: false,
      setModules: null,
    };
  }

  setSetCriterionInstancesHaveChanged = () => {
    this.setState({ setCriterionInstancesHaveChanged: true });
  };

  /**
   * Retrieve set CIs from server.
   */
  getSetCriterionInstances = () => {
    const { setId } = this.props;

    this.setState({ setCriterionInstancesLoading: true });

    requestSetCriterionInstances(setId, {
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            setCriterionInstancesLoading: false,
            setCriterionInstancesError: false,
            setCriterionInstances: res.data.data,
            setCriterionInstancesHaveChanged: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            setCriterionInstancesLoading: false,
            setCriterionInstancesError: true,
            setCriterionInstances: [],
          });
          console.error("An error occurred retrieving the set criterion instances.");
        }
      });
  };

  /**
   * Retrieve set modules from server.
   */
  getSetModules = () => {
    const { setId } = this.props;

    this.setState({ setModulesLoading: true });

    requestSetModules(setId, {
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            setModulesLoading: false,
            setModulesError: false,
            setModules: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            setModulesLoading: false,
            setModulesError: true,
            setModules: [],
          });
          console.error("An error occurred retrieving the set modules.");
        }
      });
  };

  componentDidMount() {
    const { programSets, setId } = this.props;

    let _set = find(programSets, (s) => {
      return Number(setId) === Number(s.id);
    });

    this.setState({
      set: _set,
    });

    this.getSetCriterionInstances();
    this.getSetModules();
  }
  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { currentUser, program, setId } = this.props;
    const {
      set,
      setCriterionInstancesLoading,
      setCriterionInstances,
      setCriterionInstancesHaveChanged,
      setModulesLoading,
      setModules,
    } = this.state;

    if (
      isNil(setCriterionInstances) ||
      setCriterionInstancesLoading ||
      isNil(setModules) ||
      setModulesLoading
    ) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* SET CRITERION INSTANCES INDEX */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id/questions"
            currentUser={currentUser}
            render={({ match }) => (
              <PageCriterionInstances
                currentUser={currentUser}
                program={program}
                set={set}
                setId={setId}
                refreshSetCriterionInstances={this.refreshSetCriterionInstances}
                setCriterionInstancesHaveChanged={setCriterionInstancesHaveChanged}
                setCriterionInstances={setCriterionInstances}
                setModules={setModules}
              />
            )}
          />

          {/* CREATE NEW SET CRITERION INSTANCE*/}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id/questions/new"
            currentUser={currentUser}
            render={({ match }) => (
              <PageCriterionInstanceNew
                currentUser={currentUser}
                program={program}
                set={set}
                setCriterionInstances={setCriterionInstances}
                declareSetCriterionInstancesHaveChanged={
                  this.declareSetCriterionInstancesHaveChanged
                }
                setModules={setModules}
              />
            )}
          />

          {/* SET CRITERION INSTANCE DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id/questions/:criterion_instance_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageCriterionInstance
                currentUser={currentUser}
                program={program}
                set={set}
                setCriterionInstances={setCriterionInstances}
                criterionInstanceId={Number(match.params.criterion_instance_id)}
                declareSetCriterionInstancesHaveChanged={
                  this.declareSetCriterionInstancesHaveChanged
                }
                setModules={setModules}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default compose(withRouter)(ProgramSetCriterionInstancesRouting);
