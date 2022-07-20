import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import { isNil } from "lodash";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import PageTerms from "../terms/index.js";
import PageTerm from "../terms/detail.js";
import PageTermNew from "../terms/new.js";
import { requestTerms } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/organizations`
 *
 * See propTypes for required props.
 */
class TermsRouting extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // Bound methods so child routes can update data otherwise controlled here.
    // https://reactjs.org/docs/faq-functions.html#bind-in-constructor-es2015
    this.refreshTerms = this.getTerms.bind(this);

    // Method to call when criteria are added/updated so
    // components that need the latest info know to ask for it.
    this.declareTermsHaveChanged = this.setTermsHaveChanged.bind(this);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      termsLoading: false,
      termsError: false,
      terms: null,
      termsHaveChanged: false,
    };
  }

  setTermsHaveChanged = () => {
    this.setState({ termsHaveChanged: true });
  };

  /**
   * Retrieve terms from server.
   */
  getTerms = () => {
    this.setState({ termsLoading: true });

    requestTerms({
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            termsLoading: false,
            termsError: false,
            terms: res.data.data,
            termsHaveChanged: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            termsLoading: false,
            termsError: true,
            terms: [],
          });
          console.error("An error occurred retrieving terms.");
        }
      });
  };

  componentDidMount() {
    this.getTerms();
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { currentUser } = this.props;
    const { termsLoading, terms, termsHaveChanged } = this.state;

    if (isNil(terms) || termsLoading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* TERM INDEX */}
          <AdminRoute
            exact
            path="/app/admin/terms"
            currentUser={currentUser}
            render={() => <PageTerms currentUser={currentUser} />}
          />

          {/* NEW TERM */}
          <AdminRoute
            exact
            path="/app/admin/terms/new"
            currentUser={currentUser}
            component={({ match }) => (
              <PageTermNew
                termId={Number(match.params.term_id)}
                currentUser={currentUser}
                terms={terms}
                declareTermsHaveChanged={this.declareTermsHaveChanged}
              />
            )}
          />

          {/* TERM DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/terms/:term_id"
            currentUser={currentUser}
            component={({ match }) => (
              <PageTerm
                refreshTerms={this.refreshTerms}
                termsHaveChanged={termsHaveChanged}
                terms={terms}
                termId={Number(match.params.term_id)}
                declareTermsHaveChanged={this.declareTermsHaveChanged}
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
    ({ auth }) => ({
      currentUser: auth.currentUser,
    }),
    {}
  )
)(TermsRouting);
