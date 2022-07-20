import React, { Component } from "react";
import { CircularProgress } from "@mui/material";

// Just an abs positioned circular progress component.
class CircularProgressFloat extends Component {
  render() {
    return (
      <div
        style={{
          zIndex: "10",
          left: "0",
          right: "0",
          margin: "4px auto",
          width: "100%",
          position: "absolute",
          textAlign: "center",
        }}
      >
        <CircularProgress color="primary" size={20} />
      </div>
    );
  }
}

export default CircularProgressFloat;
