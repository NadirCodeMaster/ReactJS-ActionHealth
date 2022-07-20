import React, { Component } from "react";
import { Tooltip } from "@mui/material";
import { withStyles } from "@mui/styles";

// Component used to wrap potentially long strings within the application.
// Strings that exceed their container's maximum allowed width will be
// shortened with an ellipsis.  If this occurs, the string will be wrapped with
// a tooltip that will display the full string on hover.
// NOTE: When implenenting this on table cells, you will need to set a maxWidth
//       on said <TableCell>
class TextOverflow extends Component {
  constructor(props) {
    super(props);

    this.overflowRef = React.createRef();
    this.state = {
      isOverflowing: false,
    };
  }

  componentDidMount() {
    this.setState({
      isOverflowing: this.checkOverflow(this.overflowRef.current),
    });
  }

  /**
   * Checks if span ref element has overflowing text in ellipsis
   * @returns {boolean} isOverflowing
   */
  checkOverflow = () => {
    let el = this.overflowRef.current;

    if (el === undefined || el === null) return false;

    let curOverflow = el.style.overflow;

    if (!curOverflow || curOverflow === "visible") el.style.overflow = "hidden";

    let isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;

    return isOverflowing;
  };

  /**
   * Called in render() in case of viewport resizeing to maintain correct
   * tooltip wrapper status
   * @returns {boolean} isOverflowingResizeCheck
   */
  checkOverflowForResize = () => {
    const { isOverflowing } = this.state;

    let isOverflowingResizeCheck = isOverflowing;
    if (this.overflowRef.current) {
      isOverflowingResizeCheck = this.checkOverflow();
    }

    return isOverflowingResizeCheck;
  };

  render() {
    const { children, classes } = this.props;

    return (
      <ConditionalTooltip
        condition={this.checkOverflowForResize()}
        wrapper={(nestedChildren) => (
          <Tooltip title={children} placement="top">
            {nestedChildren}
          </Tooltip>
        )}
      >
        <span ref={this.overflowRef} className={classes.tooltipChild}>
          {children}
        </span>
      </ConditionalTooltip>
    );
  }
}

/**
 * Functional component to conditionally wrap span in a tooltip (if overflow exists)
 */
const ConditionalTooltip = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const styles = (theme) => ({
  tooltipChild: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    display: "block",
    overflow: "hidden",
  },
});

export default withStyles(styles, { withTheme: true })(TextOverflow);
