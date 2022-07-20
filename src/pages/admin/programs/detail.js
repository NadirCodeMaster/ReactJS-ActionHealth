import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import HtmlReactParser from "html-react-parser";
import { List, ListItem, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({});

class ProgramDetail extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape),
    program: PropTypes.object,
  };

  componentDidMount() {
    const { program } = this.props;
    if (program && !program.loading) {
      generateTitle(program.name);
    }
  }

  componentDidUpdate() {
    const { program } = this.props;
    if (program && !program.loading) {
      generateTitle(program.name);
    }
  }

  render() {
    const { program } = this.props;
    if (!program || program.loading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/programs" root>
            Program Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}`}>{program.name}</Breadcrumb>
        </Breadcrumbs>

        <Paper style={{ padding: styleVars.paperPadding }}>
          <h1>
            {program.name}
            {!program.public && (
              <React.Fragment>
                {" "}
                <em>(not public)</em>
              </React.Fragment>
            )}
          </h1>
          {HtmlReactParser(program.description || "")}
        </Paper>

        <List>
          <ListItem>
            <Link to={`/app/admin/programs/${program.id}/sets`}>
              Manage assessments in this program
            </Link>
          </ListItem>
          <ListItem>
            <Link to={`/app/admin/programs/${program.id}/organizations`}>
              View eligible organizations
            </Link>
          </ListItem>
        </List>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ProgramDetail));
