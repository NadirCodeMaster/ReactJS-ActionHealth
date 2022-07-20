import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import HgAlert from "components/ui/HgAlert";

class Errors extends React.Component {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  render() {
    const { classes, errors } = this.props;

    return errors.map((error, index) => {
      return (
        <div className={classes.margin} key={`error-${index}`}>
          <HgAlert includeIcon={true} severity="error" message={error} />
        </div>
      );
    });
  }
}

const styles = (theme) => ({
  margin: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
});

export default withStyles(styles, { withTheme: true })(Errors);
