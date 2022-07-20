import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get, head, isArray, isNil, orderBy } from "lodash";
import moment from "moment";
import { CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestOrganizationSets } from "api/requests";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

// @TODO Restrict access if appropriate

// Provides a basic list of recent Set activity by an Organization.
class OrganizationSetActivity extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    // Parameters passed to the organization sets API request.
    this.apiRequestParams = {
      per_page: 1000,
      page: 1,
    };

    this.state = {
      organizationSetsLoading: false,
      organizationSets: null,
      requestMeta: null,
    };
  }

  /**
   * Populate state.organizationSets.
   */
  getOrganizationSets = () => {
    const { organization } = this.props;

    if (organization && organization.id) {
      this.setState({
        organizationSetsLoading: true,
      });
      requestOrganizationSets(organization.id, this.apiRequestParams)
        .then((res) => {
          let orgSets = [];
          if (!isNil(res.data.data) && isArray(res.data.data)) {
            orgSets = res.data.data;
          }

          // Sort the sets.
          orgSets = this.sortOrganizationSets(orgSets);

          if (!this.isCancelled) {
            // https://stackoverflow.com/a/50429904/1191154
            this.setState({
              organizationSetsLoading: false,
              organizationSets: orgSets,
              requestMeta: res.data.meta,
            });
          }
        })
        .catch((error) => {
          // ERROR
          if (!this.isCancelled) {
            this.setState({ organizationSetsLoading: false });
            console.error("An error occurred retrieving the organization sets data.");
          }
        });
    }
  };

  /**
   * Sort organizationSets array so sets w/most recent responses are first.
   *
   * Also sorts the responses within each set.
   *
   * @param {Array} organizationSets
   * @returns {Array}
   */
  sortOrganizationSets = (organizationSets) => {
    let sorted = [];
    if (!isNil(organizationSets)) {
      // Sort the responses within each set so most recent are first.
      let i;
      for (i = 0; i < organizationSets.length; i++) {
        if (organizationSets[i].responses) {
          organizationSets[i].responses = this.sortOrganizationSetResponses(
            organizationSets[i].responses
          );
        }
      }

      // Sort the sets themselves based on the most recent responses.
      sorted = orderBy(
        organizationSets,
        [
          (set) => {
            if (set.responses && !isNil(set.responses[0])) {
              return parseInt(moment(set.responses[0].created_at).format("X"), 10);
            }
            return "";
          },
        ],
        ["desc"]
      );
    }
    return sorted;
  };

  /**
   * Sort array of responses so most recent are first.
   *
   * @param {Array} responses
   * @returns {Array}
   */
  sortOrganizationSetResponses = (responses) => {
    let sorted = [];
    if (!isNil(responses) && isArray(responses)) {
      sorted = orderBy(
        responses,
        [(r) => parseInt(moment(r.created_at).format("X"), 10)],
        ["desc"]
      );
    }
    return sorted;
  };

  componentDidMount() {
    // Initial call to populate our results.
    this.getOrganizationSets();
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { classes, organization } = this.props;
    const { organizationSets, organizationSetsLoading } = this.state;

    if (organizationSetsLoading) {
      return (
        <List>
          <ListItem>
            <CircularProgress size="1em" />
          </ListItem>
        </List>
      );
    }

    if (!organizationSets) {
      // Code would only get to here if the API request failed.
      return null;
    }

    return (
      <React.Fragment>
        {(isNil(organizationSets) || organizationSets.length < 1) && (
          <List>
            <ListItem>There is no activity available for this organization.</ListItem>
          </List>
        )}

        {!isNil(organizationSets) && organizationSets.length > 0 && (
          <List disablePadding>
            {organizationSets.map((set, idx) => {
              let nameFirst, nameLast;
              let hasResponses = get(set, "responses", []).length > 0;
              // Can check first (head) because they are sorted with most recent first
              if (hasResponses) {
                nameFirst = get(head(set.responses), "user.name_first", "");
                nameLast = get(head(set.responses), "user.name_last", "");
              }

              return (
                <li key={set.id} style={{ margin: 0 }}>
                  <ListItem
                    button
                    component={Link}
                    divider={idx < organizationSets.length - 1}
                    to={`/app/programs/${set.program_id}/organizations/${organization.id}/sets/${set.id}`}
                  >
                    <ListItemText
                      primary={<strong>{set.name}</strong>}
                      secondary={
                        <React.Fragment>
                          <em>
                            {set.responses && hasResponses
                              ? "Working on Assessment"
                              : "Not Started"}
                          </em>
                          {hasResponses && (
                            <span className={classes.lastUpdate}>
                              Last Update (saved response):{" "}
                              {moment.utc(set.responses[0].created_at).format("M/D/YY")}{" "}
                              {!isNil(nameFirst) && !isNil(nameLast) && (
                                <React.Fragment>
                                  by {nameFirst} {nameLast}
                                </React.Fragment>
                              )}
                            </span>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </li>
              );
            })}
          </List>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  lastUpdate: {
    display: "block",
  },
});

const mapStateToProps = (state) => {
  return {
    programs: state.programs,
    currentUser: state.auth.currentUser,
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
)(withStyles(styles, { withTheme: true })(OrganizationSetActivity));
