import React from "react";
import { Route } from "react-router-dom";

class FetchComponent extends React.Component {
  componentDidMount() {
    this.props.fetch(this.props);
  }
  render() {
    return null;
  }
}

export default ({ fetch, ...rest }) => (
  <Route {...rest} render={(props) => <FetchComponent {...props} fetch={fetch} />} />
);
