/**
 * @see {https://github.com/bfischer/React-inline-editing/blob/master/src/main.jsx}
 */

import PropTypes from "prop-types";
import React from "react";

class InlineEditable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: this.props.isEditing || false,
      previousValue: this.props.text,
    };
  }

  handleFocus = () => {
    if (!this.props.isLocked) {
      if (this.state.isEditing) {
        /**
         *
         */
        if (this.props.required && !this.props.text) {
          this.handleChange({
            target: { value: this.state.previousValue, name: this.props.name },
          });
        }
        if (typeof this.props.onFocusOut === "function") {
          this.props.onFocusOut(this.props.name);
        }
      } else {
        if (typeof this.props.onFocus === "function") {
          this.setState({ previousValue: this.props.text });
          this.props.onFocus(this.props.name);
        }
      }
      this.setState({
        isEditing: !this.state.isEditing,
      });
    }
  };

  handleChange = (e) => {
    this.props.onChange(e);
  };

  render() {
    if (this.state.isEditing) {
      // render prop
      const inputElementWithProps = React.cloneElement(this.props.inputElement, {
        onChange: this.handleChange,
        onBlur: this.handleFocus,
        autoFocus: true,
        value: this.props.draft === undefined ? this.props.text : this.props.draft,
        name: this.props.name,
        id: this.props.id,
      });
      return <React.Fragment>{inputElementWithProps}</React.Fragment>;
    }
    let { displayTransform } = this.props;
    if (!displayTransform || typeof displayTransform !== "function") {
      displayTransform = (item) => item;
    }
    const textElementWithInputProps = React.cloneElement(this.props.textNode, {
      className: this.props.labelClassName,
      onClick: this.handleFocus,
      ...(this.props.text && { children: displayTransform(this.props.text) }),
      ...(!this.props.text && { style: { fontStyle: "italic" } }),
    });
    return <React.Fragment>{textElementWithInputProps}</React.Fragment>;
  }
}

InlineEditable.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  draft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isLocked: PropTypes.bool,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
  isEditing: PropTypes.bool,
  textNode: PropTypes.node.isRequired,
  inputElement: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  displayTransform: PropTypes.func,
};

export default InlineEditable;
