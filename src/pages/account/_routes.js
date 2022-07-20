import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import PrivateRoute from "components/ui/PrivateRoute";
import PageDashboard from "./dashboard/index.js";
import PageDeactivate from "./deactivate";
import PageLogin from "./login";
import PageLogout from "./logout";
import PageLoggedOut from "./logged-out";
import PageForgot from "./forgot";
import PageOrganizations from "./organizations/index.js";
import PageOrganizationJoinStep1 from "./organizations/join/step1";
import PageOrganizationJoinStep2 from "./organizations/join/step2";
import PageOrganizationJoinStep3 from "./organizations/join/step3";
import PageOrganizationDetailPages from "./organizations/detail/index.js";
import PageProfile from "./profile";
import PageReactivate from "./reactivate";
import PageRedeemInvite from "./redeem-invite";
import PageRegister from "./register/index.js";
import PageRegisterVerification from "./register/verification.js";
import PageRegisterVerificationHandler from "./register/verification-handler.js";
import PageResetPassword from "./reset-password";
import PageReports from "./reports";
import PageWelcomeBack from "./welcome-back";
import PageWelcomeBackHandler from "./welcome-back/handle";
import { currentUserShape } from "constants/propTypeShapes";

const registrationEmailCookieName = "p2regemail";

class AccountRoutes extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { currentUser } = this.props;

    // Note: Don't use currentUser.loading with a spinner here because
    // the registration then does a page refresh when a server-side
    // validation error occurs (i.e., email already in use).
    // @TODO Sort that out.

    return (
      <React.Fragment>
        <Switch>
          <Redirect exact from="/app/account" to="/app/account/dashboard" />

          <Route exact path="/app/account/forgot" render={() => <PageForgot />} />

          <Redirect
            exact
            from="/app/account/resetpassword/:token+"
            to="/app/account/reset-password/:token+"
          />

          <Route
            exact
            path="/app/account/reset-password/:token+"
            render={(props) => <PageResetPassword {...props} />}
          />

          <Route exact path="/app/account/welcome-back" render={() => <PageWelcomeBack />} />

          <Route
            exact
            path="/app/account/welcome-back/:token+"
            render={(props) => <PageWelcomeBackHandler {...props} />}
          />

          <Route
            exact
            path="/app/account/redeem-invite/:invite_token"
            render={({ location, match }) => (
              <PageRedeemInvite
                emailCookieName={registrationEmailCookieName}
                inviteToken={match.params.invite_token}
                currentUser={currentUser}
                location={location}
              />
            )}
          />

          <Route exact path="/app/account/login" render={() => <PageLogin />} />

          <Route
            exact
            path="/app/account/logout"
            currentUser={currentUser}
            render={() => <PageLogout />}
          />

          <Route exact path="/app/account/logged-out" render={() => <PageLoggedOut />} />

          {/* Registration page and all beneath it. */}
          <Route
            exact
            path="/app/account/register"
            render={({ location }) => (
              <PageRegister emailCookieName={registrationEmailCookieName} location={location} />
            )}
          />

          <Route
            exact
            path="/app/account/register/verification"
            render={({ location }) => (
              <PageRegisterVerification
                emailCookieName={registrationEmailCookieName}
                location={location}
              />
            )}
          />

          <Route
            exact
            path="/app/account/register/verification/:verification_token+"
            render={({ location, match }) => (
              <PageRegisterVerificationHandler
                verificationToken={match.params.verification_token}
              />
            )}
          />

          <PrivateRoute
            exact
            path="/app/account/dashboard"
            currentUser={currentUser}
            redirectBackOnLogin={true}
            render={() => <PageDashboard />}
          />

          <PrivateRoute
            exact
            path="/app/account/organizations"
            currentUser={currentUser}
            redirectBackOnLogin={true}
            render={() => <PageOrganizations />}
          />

          {/* Join Org Step 1: Select org type */}
          <PrivateRoute
            exact
            path="/app/account/organizations/join"
            currentUser={currentUser}
            redirectBackOnLogin={true}
            render={() => <PageOrganizationJoinStep1 />}
          />

          {/* Redirect to Step 2 if user lands on this ambiguous path  */}
          <Redirect
            exact
            from="/app/account/organizations/join/:orgtype_machine_name"
            to="/app/account/organizations/join/:orgtype_machine_name/find"
          />

          {/* Join Org Step 2: Find org based on state, parent  */}
          <PrivateRoute
            path="/app/account/organizations/join/:orgtype_machine_name/find/:state_id?/:parent_id?"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationJoinStep2
                orgTypeMachineName={match.params.orgtype_machine_name}
                providedStateId={match.params.state_id}
                providedParentId={Number(match.params.parent_id)}
              />
            )}
          />

          {/* Join Org Step 3: Select user function stuff, complete join */}
          <PrivateRoute
            path="/app/account/organizations/join/:orgtype_machine_name/:organization_id"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationJoinStep3
                orgTypeMachineName={match.params.orgtype_machine_name}
                organizationId={Number(match.params.organization_id)}
              />
            )}
          />

          <PrivateRoute
            exact
            path="/app/account/reports"
            currentUser={currentUser}
            redirectBackOnLogin={true}
            render={() => <PageReports />}
          />

          <PrivateRoute
            exact
            path="/app/account/profile"
            currentUser={currentUser}
            redirectBackOnLogin={true}
            render={() => <PageProfile />}
          />

          {/* All org-specific account routes. */}
          <PrivateRoute
            path="/app/account/organizations/:organization_id"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <PageOrganizationDetailPages organizationId={Number(match.params.organization_id)} />
            )}
          />

          <Route exact path="/app/account/reactivate" render={() => <PageReactivate />} />

          <PrivateRoute
            exact
            path="/app/account/deactivate"
            currentUser={currentUser}
            redirectBackOnLogin={false}
            render={() => <PageDeactivate />}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(
    (state) => ({
      currentUser: state.auth.currentUser,
    }),
    mapDispatchToProps
  )
)(AccountRoutes);
