import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import isResourceDetailUrl from "utils/isResourceDetailUrl";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

/**
 * Displays list of Translations
 *
 * Intended as simple, user-facing list typically displayed resource detail pages
 */
class ResourceTranslations extends React.Component {
  static propTypes = {
    translations: PropTypes.object.isRequired,
  };

  render() {
    const { classes, translations } = this.props;

    return (
      <ul>
        {Object.keys(translations).map((key) => {
          let translation = translations[key];
          return (
            <li key={`translation_${translation.id}`}>
              {isResourceDetailUrl(translation.link_url) ? (
                <Link
                  className={clsx("print-without-link-color", classes.overflowWrapContainer)}
                  to={`/app/resources/${translation.id}`}
                >
                  {translation.language.endonym}
                </Link>
              ) : (
                <a
                  className={clsx("print-without-link-color", classes.overflowWrapContainer)}
                  href={translation.link_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {translation.language.endonym}
                </a>
              )}
              <div className="only-print">
                https://healthiergeneration.org/app/resources/{translation.id}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}

const styles = (theme) => ({
  overflowWrapContainer: {
    overflowWrap: "break-word",
    wordWrap: "break-word",
    hyphens: "auto",
  },
  resourceLogInRequired: {
    fontSize: styleVars.txtFontSizeXs,
    marginLeft: theme.spacing(),
    fontStyle: "italic",
  },
});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ResourceTranslations));
