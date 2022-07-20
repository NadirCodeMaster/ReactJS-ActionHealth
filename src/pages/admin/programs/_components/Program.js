import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import HtmlReactParser from "html-react-parser";
import { Button, Card, CardActions, CardContent } from "@mui/material";
import { withStyles } from "@mui/styles";
import { currentUserShape } from "constants/propTypeShapes";

const styles = (theme) => ({});

class ProgramTeaser extends Component {
  static propTypes = {
    program: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
  };

  render() {
    const { classes, program, currentUser } = this.props;

    return (
      <Card>
        <CardContent>
          <h1>
            {program.name}
            {!program.public && (
              <React.Fragment>
                {" "}
                <small>(not public)</small>
              </React.Fragment>
            )}
          </h1>
          {HtmlReactParser(program.description || "")}
        </CardContent>
        <CardActions className={classes.actions}>
          <Button color="primary" component={Link} to={`/app/account/organizations/join`}>
            Join an organization
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProgramTeaser);
