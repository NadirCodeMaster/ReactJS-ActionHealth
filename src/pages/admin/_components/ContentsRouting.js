import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import { isNil } from "lodash";
import PropTypes from "prop-types";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import AdminRoute from "components/ui/AdminRoute";
import PageContents from "../contents/index.js";
import PageContentsDetail from "../contents/detail.js";
import { requestContents } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/contents`
 */
class ContentsRouting extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.refreshContents = this.getContents.bind(this);
    this.declareContentsHaveChanged = this.setContentsHaveChanged.bind(this);
    this.isCancelled = false;

    this.state = {
      contentLoading: false,
      contentError: false,
      contents: null,
      contentHaveChanged: false,
    };
  }

  setContentsHaveChanged = () => {
    this.setState({ contentsHaveChanged: true });
  };

  /**
   * Retrieve contents from server.
   */
  getContents = () => {
    this.setState({ contentsLoading: true });

    requestContents({
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            contentsLoading: false,
            contentsError: false,
            contents: res.data.data,
            contentsHaveChanged: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            contentsLoading: false,
            contentsError: true,
            contents: [],
          });
          console.error("An error occurred retrieving contents.");
        }
      });
  };

  componentDidMount() {
    this.getContents();
  }
  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { currentUser } = this.props;
    const { contentsLoading, contents, contentsHaveChanged } = this.state;

    if (isNil(contents) || contentsLoading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* CONTENTS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/content"
            currentUser={currentUser}
            render={({ match }) => (
              <PageContents
                refreshContents={this.refreshContents}
                contentsHaveChanged={contentsHaveChanged}
                contents={contents}
              />
            )}
          />

          {/* CONTENT DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/content/:content_machine_name"
            currentUser={currentUser}
            render={({ match }) => (
              <PageContentsDetail
                refreshContents={this.refreshContents}
                contentsHaveChanged={contentsHaveChanged}
                contents={contents}
                contentMachineName={match.params.content_machine_name}
                declareContentsHaveChanged={this.declareContentsHaveChanged}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default compose(
  withRouter,
  connect(
    ({ auth, programs }) => ({
      programs,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(ContentsRouting);
