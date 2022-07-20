import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get, isNil, isString, trim } from "lodash";
import { withStyles } from "@mui/styles";
import { Button } from "@mui/material";
import { requestOrganization } from "api/requests";
import orgTypeName from "utils/orgTypeName";
import generateTitle from "utils/generateTitle";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

/**
 * Organization profile component.
 *
 * Organizations are currently read-only in P2, so this just
 * displays data. Intended for both admin and user-facing displays
 * with corresponding adjustments made based on adminMode prop.
 */

const styles = (theme) => ({});

class OrganizationProfile extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    adminMode: PropTypes.bool,
    organizationTypes: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  static defaultProps = {
    adminMode: false,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      parentLoading: null,
      parent: null,
      accessChecked: false,
      userCanViewTeam: false,
    };
  }

  teamUrl = (org) => {
    const { adminMode } = this.props;
    if (adminMode) {
      return "/app/admin/organizations/" + org.id + "/team";
    }
    return "/app/account/organizations/" + org.id + "/team";
  };

  /**
   * Returns a displayable string for the address of an org.
   */
  displayableAddress(org) {
    let address_line_1 = trim(get(org, "address_line_1", ""));
    let address_line_2 = trim(get(org, "address_line_2", ""));
    let hasTwoAddressLines = false;
    if (address_line_1.length > 0 && address_line_2.length > 0) {
      hasTwoAddressLines = true;
    }

    let city = get(org, "city", "");
    city = isString(city) ? trim(city) : "";

    let stateAbbr = get(org, "state_id", "");
    stateAbbr = isString(stateAbbr) ? trim(stateAbbr).toUpperCase() : "";

    let hasCityAndState = false;
    if (city.length > 0 && stateAbbr.length > 0) {
      hasCityAndState = true;
    }
    let postcode = get(org, "postcode", "");

    return (
      <React.Fragment>
        {hasTwoAddressLines && (
          <React.Fragment>
            {address_line_1}
            <br />
            {address_line_2}
          </React.Fragment>
        )}
        {!hasTwoAddressLines && (
          <React.Fragment>
            {address_line_1} {address_line_2}
          </React.Fragment>
        )}
        <br />
        {hasCityAndState && (
          <React.Fragment>
            {city}, {stateAbbr} {postcode}
          </React.Fragment>
        )}
        {!hasCityAndState && (
          <React.Fragment>
            {city} {stateAbbr} {postcode}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  // Retrieve the parent organization record from server, add to state.
  getParent() {
    const { organization } = this.props;

    let parentId;
    if (!isNil(organization.parent_id)) {
      parentId = organization.parent_id;
    } else {
      return; // nothing to do here.
    }

    this.setState({ parentLoading: true });

    requestOrganization(parentId)
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            parentLoading: false,
            parent: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ parentLoading: false });
          console.error("An error occurred retrieving the parent organization.");
        }
      });
  }

  componentDidMount() {
    const { currentUser, organization } = this.props;
    this.getParent();

    if (userCan(currentUser, organization, "view_team")) {
      this.setState({ userCanViewTeam: true });
    }
    if (organization) {
      generateTitle(organization.name);
    }
  }

  componentDidUpdate() {
    const { organization } = this.props;
    if (organization) {
      generateTitle(organization.name);
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { adminMode, organizationTypes, organization } = this.props;
    const { parent, parentLoading, userCanViewTeam } = this.state;

    let showParent = !isNil(parent) || parentLoading;
    let parentUrl = false;
    if (!isNil(parent) && adminMode) {
      // Only link to parent in admin mode because there's
      // no org role perm we can check for access to
      // parent account org page.
      parentUrl = `/app/admin/organizations/${parent.id}`;
    }

    return (
      <React.Fragment>
        <header>
          <p style={{ marginBottom: "0.35em" }}>
            {orgTypeName(organization, organizationTypes)} Profile
          </p>
          <h1>{organization.name}</h1>
        </header>

        {showParent && (
          <p>
            {parentLoading && (
              <React.Fragment>
                <em>Loading parent organization...</em>
              </React.Fragment>
            )}
            {parent && parentUrl && <Link to={parentUrl}>{parent.name}</Link>}
            {parent && !parentUrl && <React.Fragment>{parent.name}</React.Fragment>}
          </p>
        )}

        <br />

        <p>{this.displayableAddress(organization)}</p>
        <br />
        {userCanViewTeam && (
          <div>
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to={this.teamUrl(organization)}
            >
              {adminMode ? "Manage Team" : "Team"}
            </Button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
    organizationTypes: state.app_meta.data.organizationTypes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // ...
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(OrganizationProfile));
