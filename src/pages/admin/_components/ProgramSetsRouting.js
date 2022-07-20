import React from "react";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Redirect, Switch } from "react-router-dom";
import { isNil } from "lodash";
import PropTypes from "prop-types";

import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import ProgramSetCriterionInstancesRouting from "./ProgramSetCriterionInstancesRouting";
import ProgramSetModulesRouting from "./ProgramSetModulesRouting";
import AdminRoute from "components/ui/AdminRoute";
import PageProgramSets from "../programs/sets/index.js";
import PageProgramSet from "../programs/sets/detail.js";
import PageProgramSetNew from "../programs/sets/new.js";
import { requestProgramSets } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/programs/:program_id/sets`
 *
 * See propTypes for required props.
 */
class ProgramSetsRouting extends React.Component {
  static propTypes = {
    program: PropTypes.object.isRequired,
    programs: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // Bound methods so child routes can update data otherwise controlled here.
    // https://reactjs.org/docs/faq-functions.html#bind-in-constructor-es2015
    this.refreshProgramSets = this.getProgramSets.bind(this);

    // Method to call when sets are added/updated so
    // components that need the latest info know to ask for it.
    this.declareProgramSetsHaveChanged = this.setProgramSetsHaveChanged.bind(this);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      programSetsLoading: false,
      programSetsError: false,
      programSets: null,
      programSetsHaveChanged: false,
    };
  }

  setProgramSetsHaveChanged = () => {
    this.setState({ programSetsHaveChanged: true });
  };

  /**
   * Retrieve program sets from server.
   */
  getProgramSets = (currentSortOrder, currentSortField) => {
    const { program } = this.props;

    this.setState({ programSetsLoading: true });

    requestProgramSets(program.id, {
      per_page: 1000,
      [currentSortField]: currentSortOrder,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            programSetsLoading: false,
            programSetsError: false,
            programSets: res.data.data,
            programSetsHaveChanged: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            programSetsLoading: false,
            programSetsError: true,
            programSets: [],
          });
          console.error("An error occurred retrieving the program sets.");
        }
      });
  };

  componentDidMount() {
    this.getProgramSets();
  }
  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { currentUser, program, programs } = this.props;
    const { programSetsLoading, programSets, programSetsHaveChanged } = this.state;

    if (isNil(programSets) || programSetsLoading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* PROGRAM SETS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramSets
                currentUser={currentUser}
                program={program}
                programs={programs}
                refreshProgramSets={this.refreshProgramSets}
                programSetsHaveChanged={programSetsHaveChanged}
                programSets={programSets}
              />
            )}
          />

          {/* CREATE NEW PROGRAM SET */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/new"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramSetNew
                programSets={programSets}
                currentUser={currentUser}
                program={program}
                programs={programs}
                declareProgramSetsHaveChanged={this.declareProgramSetsHaveChanged}
              />
            )}
          />

          {/* PROGRAM SET DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/sets/:set_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramSet
                currentUser={currentUser}
                program={program}
                programs={programs}
                programSets={programSets}
                setId={Number(match.params.set_id)}
                declareProgramSetsHaveChanged={this.declareProgramSetsHaveChanged}
              />
            )}
          />

          {/* ALL PROGRAM SET CRITERION INSTANCE ROUTES */}
          <Redirect
            exact
            from="/app/admin/programs/:program_id/sets/:set_id/criterion-instances"
            to="/app/admin/programs/:program_id/sets/:set_id/questions"
          />
          <Redirect
            exact
            from="/app/admin/programs/:program_id/sets/:set_id/criterion-instances/new"
            to="/app/admin/programs/:program_id/sets/:set_id/questions/new"
          />
          <Redirect
            exact
            from="/app/admin/programs/:program_id/sets/:set_id/criterion-instances/:criterion_instance_id"
            to="/app/admin/programs/:program_id/sets/:set_id/questions/:criterion_instance_id"
          />
          <AdminRoute
            path="/app/admin/programs/:program_id/sets/:set_id/questions"
            currentUser={currentUser}
            render={({ match }) => (
              <ProgramSetCriterionInstancesRouting
                currentUser={currentUser}
                program={program}
                programs={programs}
                programSets={programSets}
                setId={Number(match.params.set_id)}
              />
            )}
          />

          {/* ALL PROGRAM SET MODULE ROUTES */}
          <AdminRoute
            path="/app/admin/programs/:program_id/sets/:set_id/modules"
            currentUser={currentUser}
            render={({ match }) => (
              <ProgramSetModulesRouting
                currentUser={currentUser}
                program={program}
                programSets={programSets}
                setId={Number(match.params.set_id)}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default compose(withRouter)(ProgramSetsRouting);
