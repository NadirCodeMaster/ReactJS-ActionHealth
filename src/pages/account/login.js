import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Link, Redirect } from "react-router-dom";
import { ValidatorForm } from "react-material-ui-form-validator";
import HgTextValidator from "components/ui/HgTextValidator";
import qs from "qs";
import { Button, CircularProgress, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { has, isNil, isString } from "lodash";
import { attemptLogin } from "store/actions";
import { isEmailMessage, requiredMessage } from "form_utils";
import Errors from "components/ui/Errors";
import HgAlert from "components/ui/HgAlert";
import Checkbox from "components/ui/CheckboxWrapper";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { getCsrfToken } from "api/csrfToken";
import authConfigs from "constants/authConfigs";
import isAbsoluteUrl from "utils/isAbsoluteUrl";
import generateTitle from "utils/generateTitle";
import validateAppDest from "utils/validateAppDest";
import { requestCsrfCookie } from "api/requests";
import styleVars from "style/_vars.scss";

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

class Login extends Component {
  state = {
    username: "",
    password: "",
    errors: [],
    keepSigned: false,
    showPassword: false,
  };

  emailRef = React.createRef();

  componentDidMount() {
    generateTitle("Login");
  }

  componentDidUpdate(prevProps) {
    const { currentUser: prevCurrentUser } = prevProps;
    const { currentUser } = this.props;

    if (prevCurrentUser.loading && !currentUser.loading) {
      this.setState({ errors: currentUser.errors });
    }
    generateTitle("Login");
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleBlur = (e) => {
    const { value } = e.target;

    this.emailRef.current.validate(value);
  };

  togglePassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  toggleKeepSigned = () => {
    this.setState({ keepSigned: !this.state.keepSigned });
  };

  onSubmit = () => {
    const { attemptLogin } = this.props;
    const { username, password, keepSigned } = this.state;
    let _csrfToken = getCsrfToken();

    if (_csrfToken) {
      attemptLogin({
        email: username,
        password,
        remember: keepSigned,
      });
    }

    if (!_csrfToken) {
      requestCsrfCookie()
        .then((res) => {
          if (!this.isCancelled) {
            attemptLogin({
              email: username,
              password,
              remember: keepSigned,
            });
          }
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  };

  render() {
    const { classes, location, currentUser, width } = this.props;
    const { errors } = this.state;

    // Wait for user to be bootstrapped before doing anything.
    if (!currentUser.bootstrapped) {
      return <CircularProgressGlobal />;
    }

    const params = qs.parse(location.search, { ignoreQueryPrefix: true });

    // RelayState and SAMLRequest are exclusively for SSO-related requests.
    let RelayState = isNil(params.RelayState) ? null : params.RelayState;
    let SAMLRequest = isNil(params.SAMLRequest) ? null : params.SAMLRequest;
    let samlDest;

    // Handling for SSO requests.
    // Establish the the API-side SSO URL that will be the
    // when the request includes SAML parameters. Only
    // applicable when request has SAMLRequest as a GET
    // parameter (not when SAMLRequest part of a URL within
    //  another parameter, i.e., appDest).
    if (SAMLRequest) {
      // Note that this value may be used to populate an appDest
      // URL parameter, so be sure it passes validateAppDest().
      samlDest =
        process.env.REACT_APP_API_URL +
        authConfigs.authSamlEndpointPath +
        "?" +
        qs.stringify({
          RelayState,
          SAMLRequest,
        });
    }

    // Post-login destination.
    // This value will also be passed to the registration link
    // to be used after registration and verification if user
    // doesn't yet have an account.
    let defaultRedirectTo = "/app/account/dashboard";
    let redirectTo = defaultRedirectTo;

    // Flag for whether to show the "login required" alert.
    let showLoginAlert = false;

    // Use SAML destination if possible.
    if (samlDest) {
      redirectTo = samlDest;
      showLoginAlert = true;
    }
    // Use appDest if available and SAML destination above is not.
    // @see src/utils/validateAppDest()
    else if (params.appDest && validateAppDest(params.appDest)) {
      redirectTo = params.appDest;
      showLoginAlert = true;
    }
    // Or try previous location if redirected here.
    // Note: This assumes location.state.from will only have
    // a value when reaching this page via a redirect.
    // I can't locate docs saying that, but it appears to be
    // true based on experimentation.
    else if (location && location.state && location.state.from) {
      redirectTo = location.state.from;
      showLoginAlert = true;
    }

    // If we ended up with a redirectTo that is the same as
    // our defaultRedirectTo, be sure we omit the "login required" alert.
    if (
      (isString(redirectTo) && defaultRedirectTo === redirectTo) ||
      (has(redirectTo, "pathname") && defaultRedirectTo === redirectTo.pathname)
    ) {
      showLoginAlert = false;
    }

    // ----------------------------
    // HANDLING AUTHENTICATED USERS
    // ----------------------------
    // Redirect authenticated users and
    // return before the login form can
    // render.
    // ----------------------------

    if (currentUser.isAuthenticated) {
      if (isAbsoluteUrl(redirectTo)) {
        try {
          window.location = redirectTo;
        } catch (e) {
          console.error(e);
        }
      } else {
        return <Redirect to={redirectTo} />;
      }
      // Return to avoid rendering of login form.
      return null;
    }

    // ------------------------------
    // HANDLING UNAUTHENTICATED USERS
    // ------------------------------
    // Method will have returned by now
    // for authenticated users.
    // ------------------------------

    // Destination path for registration, in case we need it.
    // Include redirectTo value as an appDest parameter if possible.
    let regPath = "/app/account/register";
    let forgotPath = "/app/account/forgot";
    if (redirectTo) {
      if (!isString(redirectTo) && redirectTo.pathname) {
        // In case it's a location object.
        redirectTo = redirectTo.pathname;
      }
      regPath = `${regPath}?${qs.stringify({ appDest: redirectTo })}`;
      forgotPath = `${forgotPath}?${qs.stringify({ appDest: redirectTo })}`;
    }

    return (
      <div className={classes.outerWrapper}>
        {showLoginAlert && (
          <section className={classes.sectionLoginAlert}>
            <HgAlert
              severity="warning"
              message="Please log in to view this content"
              includeIcon={true}
            />
          </section>
        )}
        <div className={classes.wrapper}>
          <section className={classes.sectionLogin}>
            <Paper className={classes.paper}>
              <h2 className={classes.loginHeader}>Already have an Action Center account?</h2>
              <ValidatorForm onSubmit={this.onSubmit} autoComplete="on" instantValidate={false}>
                <div>
                  <HgTextValidator
                    ref={this.emailRef}
                    name={"username"}
                    autoComplete="email"
                    label={"Email"}
                    type="email"
                    id="login_username"
                    onChange={(e) => this.handleChange(e)}
                    onBlur={this.handleBlur}
                    value={this.state.username}
                    validators={["required", "isEmail"]}
                    errorMessages={[requiredMessage, isEmailMessage]}
                    margin="normal"
                    fullWidth
                  />
                </div>
                <div>
                  <HgTextValidator
                    name={"password"}
                    autoComplete="current-password"
                    label={"Password"}
                    id="login_password"
                    type={this.state.showPassword ? "text" : "password"}
                    onChange={(e) => this.handleChange(e)}
                    value={this.state.password}
                    validators={["required"]}
                    errorMessages={[requiredMessage]}
                    margin="normal"
                    fullWidth
                  />
                </div>
                <div className={classes.checkboxesWrapper}>
                  <Checkbox
                    name={"showPassword"}
                    value={"showPassword"}
                    label={"Show Password"}
                    checked={this.state.showPassword}
                    handleChange={() => this.togglePassword()}
                  />
                  <Checkbox
                    name={"keepSigned"}
                    value={"keepSigned"}
                    label={"Keep me signed in"}
                    checked={this.state.keepSigned}
                    handleChange={() => this.toggleKeepSigned()}
                  />
                </div>
                <Errors errors={errors} />
                <Button
                  className={classes.loginButton}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={currentUser.loading}
                >
                  {currentUser.loading ? (
                    <React.Fragment>
                      &nbsp;
                      <CircularProgress size="1em" />
                    </React.Fragment>
                  ) : (
                    <span>Log in</span>
                  )}
                </Button>

                <p className={classes.forgotLinkWrapper}>
                  <Link to={forgotPath}>Forgot your password?</Link>
                </p>
              </ValidatorForm>
            </Paper>
          </section>
          <section className={classes.sectionSignup}>
            <div className={classes.signupIntro}>
              <h1>Let&#8217;s create a Healthier Generation!</h1>
              <p>
                Explore the Action Center to access tools and guidance to create healthier
                environments that support students&#8217; physical, social, and emotional
                well-being.
              </p>
              <p>
                <strong>You can use the Action Center to:</strong>
              </p>
              <ul>
                <li>
                  Assess the health and wellness of your school, district, or out-of-school time
                  site
                </li>
                <li>
                  Identify opportunities to improve policies and practices that promote well-being
                  for kids, teachers, and staff using the Thriving Schools Integrated Assessment
                </li>
                <li>
                  Increase resilience of students and staff using the RISE Index, presented in
                  partnership with Kaiser Permanente
                </li>
                <li>
                  <Link to="/app/resources">Find resources</Link> that help families prioritize
                  healthy living and create home environments where everyone can thrive
                </li>
                <li>
                  Access trainings on physical education and activity, employee wellness, nutrition,
                  social-emotional health and learning, policy, and more
                </li>
              </ul>
            </div>
            <div className={classes.signupCta}>
              <h2 className={classes.signupCtaHeader}>Ready to get started?</h2>
              <p>Take 1 minute to create your free account.</p>
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  fullWidth={width === "xs"}
                  to={regPath}
                >
                  Create your Action Center account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

const styles = (theme) => ({
  wrapper: {
    margin: "0 auto",
    maxWidth: "1060px",
    [theme.breakpoints.up("md")]: {
      display: "flex",
      marginTop: theme.spacing(4),
    },
  },
  sectionLoginAlert: {
    marginBottom: theme.spacing(3),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "600px",
    [theme.breakpoints.up("md")]: {
      marginBottom: 0,
      marginLeft: "unset",
      marginRight: "unset",
      maxWidth: "unset",
    },
  },
  sectionSignup: {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "600px",
    padding: styleVars.paperPadding,
    [theme.breakpoints.up("md")]: {
      flex: "0 1 60%",
      order: 0,
      marginLeft: "unset",
      marginRight: "unset",
      maxWidth: "unset",
      paddingLeft: 0,
      paddingRight: theme.spacing(8),
      paddingTop: 0,
    },
  },
  sectionLogin: {
    marginBottom: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "600px",
    [theme.breakpoints.up("md")]: {
      flex: "0 1 40%",
      marginBottom: theme.spacing(6),
      marginLeft: "unset",
      marginRight: "unset",
      maxWidth: "unset",
      order: 1,
    },
  },
  loginHeader: {
    fontSize: "1.4em",
  },
  signupIntro: {
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.up("sm")]: {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up("md")]: {
      marginBottom: theme.spacing(3),
    },
  },
  signupCta: {},
  signupCtaHeader: {
    fontSize: "1.4em",
  },
  paper: {
    padding: styleVars.paperPadding,
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(4),
    },
    [theme.breakpoints.up("md")]: {
      // Intentionally not using paperPadding here.
      paddingBottom: theme.spacing(6),
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
      paddingTop: theme.spacing(4),
    },
  },
  checkboxesWrapper: {
    marginBottom: theme.spacing(2.5),
    marginTop: theme.spacing(2),
  },
  loginButton: {
    marginBottom: theme.spacing(),
  },
  register: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  warningLink: {
    color: "#fff",
  },
  forgotLinkWrapper: {
    fontSize: "0.9375em",
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(2),
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});

export default compose(
  withRouter,
  connect(mapStateToProps, {
    attemptLogin,
  }),
  withStyles(styles, { withTheme: true }),
  withWidth()
)(Login);
