import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import { isEmpty } from "lodash";
import isRootRelativePath from "utils/isRootRelativePath";

/**
 * Basic call-to-action template.
 *
 * Allows for an optional icon image, text blob and link.
 *
 * Note: If linkHref is an absolute URL this component will
 * render it as an `<a>` with `target=_blank` and the other stuff
 * that goes along with an external URL.
 *
 * If linkHref is a root-relative path, we use React
 * Router's <Link>.
 *
 * @extends Component
 */
class CtaTemplateA extends Component {
  static propTypes = {
    imgSrc: PropTypes.string,
    title: PropTypes.node, // string/HTML or element
    text: PropTypes.node, // string/HTML or element
    linkText: PropTypes.string,
    linkHref: PropTypes.string,
    theme: PropTypes.object.isRequired,
  };

  render() {
    const { classes, imgSrc, text, title, linkText, linkHref } = this.props;

    let includeImg = imgSrc && !isEmpty(imgSrc);
    let includeTitle = title && !isEmpty(title);
    let includeText = text && !isEmpty(text);
    let includeLink = linkText && linkHref && !isEmpty(linkText) && !isEmpty(linkHref);

    let linkIsExternal = true;
    if (!isEmpty(linkHref) && isRootRelativePath(linkHref)) {
      linkIsExternal = false;
    }

    return (
      <React.Fragment>
        <div className={classes.ctaContainer}>
          {includeImg && (
            <div className={classes.ctaImgWrapper}>
              <img alt="" className={classes.ctaImg} src={imgSrc} />
            </div>
          )}
          <div className={classes.ctaContentWrapper}>
            {includeTitle && <h3>{title}</h3>}
            {includeText && <div className={classes.ctaText}>{text}</div>}
            {includeLink && (
              <div className={classes.ctaLinkWrapper}>
                {linkIsExternal ? (
                  <a
                    className={classes.ctaLink}
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {linkText}
                  </a>
                ) : (
                  <Link to={linkHref} className={classes.ctaLink}>
                    {linkText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  ctaContainer: {
    display: "flex",
  },
  ctaImgWrapper: {
    flex: "0 0 48px",
  },
  ctaImg: {
    width: "70%",
  },
  ctaContentWrapper: {
    flex: "0 1 auto",
    width: "100%",
  },
  ctaText: {
    marginBottom: theme.spacing(),
  },
  ctaLinkWrapper: {},
  ctaLink: {},
});

export default withStyles(styles, { withTheme: true })(CtaTemplateA);
