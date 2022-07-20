import { Component } from "react";
import { withRouter } from "react-router";

class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    const { bypass } = this.props;

    if (!bypass) {
      let currentPath = this.props.location.pathname + "/" + this.props.location.search;
      let prevPath = prevProps.location.pathname + "/" + prevProps.location.search;
      if (currentPath !== prevPath) {
        window.scrollTo(0, 0);
      }
    }
  }

  render() {
    return this.props.children;
  }
}

ScrollToTop.defaultProps = {
  bypass: false,
};

export default withRouter(ScrollToTop);
