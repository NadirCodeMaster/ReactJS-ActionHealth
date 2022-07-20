import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { isNil, values } from "lodash";
import ProgramTeaser from "./_components/ProgramTeaser";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

class Programs extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
  };

  componentDidMount() {
    generateTitle("Action Center");
  }

  componentDidUpdate() {
    generateTitle("Action Center");
  }

  render() {
    const { programs, currentUser } = this.props;

    if (isNil(programs) || programs.loading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <h1 className="sr-only">Programs</h1>

        {values(programs.data).map((program) => (
          <ProgramTeaser
            key={program.id}
            {...{
              program,
              url: `/app/programs/${program.id}`,
              currentUser: currentUser,
            }}
          />
        ))}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

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
