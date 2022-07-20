import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { withStyles } from "@mui/styles";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

const styles = (theme) => ({});

class Programs extends Component {
  state = {};

  static propTypes = {
    programs: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  componentDidMount() {
    generateTitle("Program Management");
  }

  componentDidUpdate() {
    generateTitle("Program Management");
  }

  formatPublicValue(val) {
    return val ? "Public" : "Private";
  }

  handleRowClick = (e, prog) => {
    const { history } = this.props;
    history.push(`/app/admin/programs/${prog.id}`);
  };

  render() {
    const { programs } = this.props;

    if (!programs || programs.loading) {
      return <CircularProgressGlobal />;
    }

    let programsArray = [];
    for (var prop in programs.data) {
      if (programs.data.hasOwnProperty(prop)) {
        programsArray.push(programs.data[prop]);
      }
    }

    return (
      <React.Fragment>
        {/*
        <div className="no-print">
          <Breadcrumb path="/app/admin/programs" root>
            Program Management
          </Breadcrumb>
          <br />
          <br />
        </div>
        */}

        <h1>Program Management</h1>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Program</TableCell>
                <TableCell align="right">ID</TableCell>
                <TableCell>Visibility</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programsArray.map((prog) => {
                return (
                  <TableRow key={prog.id}>
                    <TableCell>
                      <strong>{prog.name}</strong> <br />
                      <Link to={`/app/admin/programs/${prog.id}/organizations`}>
                        Organizations
                      </Link>{" "}
                      &bull; <Link to={`/app/admin/programs/${prog.id}/sets`}>Assessments</Link>{" "}
                      &bull; <Link to={`/app/admin/programs/${prog.id}`}>More...</Link>
                    </TableCell>
                    <TableCell align="right">{prog.id}</TableCell>
                    <TableCell>{this.formatPublicValue(prog.public)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth, programs }) => ({
      programs,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(Programs));
