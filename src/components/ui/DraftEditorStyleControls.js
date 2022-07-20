import React from "react";
import clsx from "clsx";
import { getSelectionEntity } from "draftjs-utils";

export const BlockStyleControls = (props) => {
  const { allowedHtml, editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <React.Fragment>
      {allowedHtml.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          classes={props.classes}
        />
      ))}
    </React.Fragment>
  );
};

export const InlineStyleControls = (props) => {
  let currentStyle = props.editorState.getCurrentInlineStyle();
  const { allowedHtml, classes } = props;

  return (
    <React.Fragment>
      {allowedHtml.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          classes={classes}
        />
      ))}
    </React.Fragment>
  );
};

export const DecoratorControls = (props) => {
  const { allowedHtml, classes, promptForDecorator, editorState } = props;
  let currentEntity = getSelectionEntity(editorState);
  let contentState = editorState.getCurrentContent();

  return (
    <React.Fragment>
      {allowedHtml.map((type) => {
        let active = false;
        if (currentEntity && contentState.getEntity(currentEntity).get("type") === type.style) {
          active = true;
        }
        return (
          <span
            key={type.label}
            onMouseDown={(e) => promptForDecorator(e, type.style, type.label)}
            className={clsx(
              classes.RichEditorStyleButton,
              active && classes.RichEditorActiveButton
            )}
          >
            {type.label}
          </span>
        );
      })}
    </React.Fragment>
  );
};

/*
 * Style button component used for inline and block style
 */
class StyleButton extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    const { active, classes } = this.props;

    return (
      <span
        className={clsx(classes.RichEditorStyleButton, active && classes.RichEditorActiveButton)}
        onMouseDown={this.onToggle}
      >
        {this.props.label}
      </span>
    );
  }
}
