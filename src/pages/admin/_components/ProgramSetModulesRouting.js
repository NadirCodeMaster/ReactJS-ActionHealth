import React from "react";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import { isNil, find } from "lodash";
import PropTypes from "prop-types";

import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import AdminRoute from "components/ui/AdminRoute";
import PageProgramSetModules from "../programs/sets/modules/index.js";
import PageProgramSetModule from "../programs/sets/modules/detail.js";
import PageProgramSetModuleNew from "../programs/sets/modules/new.js";
import { requestSetModules } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with
 * `/app/admin/programs/:program_id/sets/:set_id/modules`
 *
 * See propTypes for required props.
 */
class ProgramSetModulesRouting extends React.Component {
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
    this.refreshSetModules = this.getSetModules.bind(this);

    // Method to call when modules are added/updated so
    // components that need the latest info know to ask for it.
    this.declareSetModulesHaveChanged = this.setSetModulesHaveChanged.bind(this);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      setModulesLoading: false,
      setModulesError: false,
      setModules: null,
      setModulesHaveChanged: false,
    };
  }

  setSetModulesHaveChanged = () => {
    this.setState({ setModulesHaveChanged: true });
  };

  /**
   * Retrieve set modules from server.
   */
  getSetModules = (currentSortOrder, currentSortField) => {
    const { setId } = this.props;

    this.setState({ setModulesLoading: true });

    requestSetModules(setId, {
      per_page: 1000,
      [currentSortField]: currentSortOrder,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            setModulesLoading: false,
            setModulesError: false,
            setModules: res.data.data,
            setModulesHaveChanged: false,
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
    this.getSetModules();
  }
  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { currentUser, program, setId } = this.props;
    const { set, setModulesLoading, setModules } = this.state;

    if (isNil(setModules) || setModulesLoading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* PROGRAM SET MODULES INDEX */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id/modules"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramSetModules
                currentUser={currentUser}
                program={program}
                set={set}
                setId={setId}
              />
            )}
          />

          {/* CREATE NEW SET MODULE*/}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id/modules/new"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramSetModuleNew
                currentUser={currentUser}
                program={program}
                set={set}
                setModules={setModules}
                declareSetModulesHaveChanged={this.declareSetModulesHaveChanged}
              />
            )}
          />

          {/* SET MODULE DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id/modules/:module_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramSetModule
                currentUser={currentUser}
                program={program}
                set={set}
                setModules={setModules}
                moduleId={Number(match.params.module_id)}
                declareSetModulesHaveChanged={this.declareSetModulesHaveChanged}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default compose(withRouter)(ProgramSetModulesRouting);
