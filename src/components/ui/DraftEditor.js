import React from "react";
import {
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import { debounce, forEach, get, isEmpty, isNil, isNull, isString, sortBy } from "lodash";
import { Button, CircularProgress, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import isAbsoluteUrl from "utils/isAbsoluteUrl";
import isRootRelativePath from "utils/isRootRelativePath";
import draftEditorTextIsEmpty from "utils/draftEditorTextIsEmpty";
import {
  findAbbrTitleEntities,
  findAbbrDataEntities,
  findLinkEntities,
} from "utils/findDecoratorEntities";
import HgSelect from "components/ui/HgSelect";
import { TermDialog, AbbrTitle, Link } from "components/ui/DecoratorComponents";
import {
  BlockStyleControls,
  InlineStyleControls,
  DecoratorControls,
} from "components/ui/DraftEditorStyleControls";
import { requestTerms } from "api/requests";
import styleVars from "style/_vars.scss";

/*
 * Draftjs editor component
 */
class DraftEditor extends React.Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findAbbrTitleEntities,
        component: AbbrTitle,
      },
      {
        strategy: findAbbrDataEntities,
        component: TermDialog,
        props: { readOnly: this.props.readOnly },
      },
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    // See if we our props included a correctly populated, structured value.
    let _providedValue = null;

    if (this.props.value) {
      _providedValue = this.props.value;
      // Above should work, but sometimes value is string of JSON rather than
      // a JSON object. So we handle that here.
      if (isString(_providedValue)) {
        try {
          _providedValue = JSON.parse(_providedValue);
        } catch (e) {
          console.error(`Tried converting string _providedValue to JSON but failed: ${e.message}`);
        }
      }
    }

    // If Editor json object is null or empty.
    let initialEditorState;

    if (draftEditorTextIsEmpty(_providedValue)) {
      initialEditorState = EditorState.createEmpty(decorator);
    } else {
      try {
        // DB may set empty text blocks to null, which messes up Draft.js. Set null text
        // props to an empty string here to get around this.
        forEach(_providedValue.blocks, (block, bdx) => {
          if (isNull(block.text)) {
            _providedValue.blocks[bdx].text = "";
          }
        });

        initialEditorState = EditorState.createWithContent(
          convertFromRaw(_providedValue),
          decorator
        );
      } catch (e) {
        console.error(
          `Error setting up initialEditorState with EditorState.createWithContent(): ${e.message}`
        );
      }
    }

    this.state = {
      editorState: initialEditorState,
      showDecInput: false,
      decValue: "",
      currentDecType: "",
      terms: [],
      linkTargetBlank: false,
      urlError: true,
    };

    if (this.props.onChange) {
      this.onChangeProp = debounce(this.props.onChange, 10);
    }
    this.focus = (moveToEnd) => this._focus(moveToEnd);
    this.promptForDecorator = this._promptForDecorator.bind(this);
    this.confirmDecorator = this._confirmDecorator.bind(this);
    this.onDecoratorInputKeyDown = this._onDecoratorInputKeyDown.bind(this);
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.onDecChange = (e) => this._setDecValueOnChange(e);
    this.clearEditor = () => this._clearEditor();
    this.onChangeEditor = (editorState, index) => this._onChangeEditor(editorState, index);
  }

  /**
   * What to do when editor is focused.
   * - The moveToEnd parameter is typically used when an outside element event
   * (like a button onClick) occurs, and we want to set the cursor at the end.
   * - Without moveToEnd, its the default behavior when focusing in the textfield.
   * This also includes preservation of previous cursor position.
   * @params {boolean} moveToEnd optional
   */
  _focus(moveToEnd) {
    const { editorState } = this.state;

    if (moveToEnd === true) {
      this.setState({ editorState: EditorState.moveFocusToEnd(editorState) });
    } else {
      this.refs.editor.focus();
    }
  }

  /**
   * Used to clear editor contents safely, generally called through ref with
   * a parent component
   */
  _clearEditor() {
    const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(""));
    this.setState({ editorState });
  }

  _setDecValueOnChange(e) {
    let value = get(e, "target.value", null);
    if (value) {
      this.setState({ decValue: value });
    }
    if (!value) {
      value = get(e, "value", null);
      this.setState({ decValue: value });
    }
  }

  _onChangeEditor(editorState) {
    const { indexProp } = this.props;
    const content = editorState.getCurrentContent();

    if (!isNil(indexProp)) {
      this.onChangeProp(convertToRaw(content), indexProp);
    } else {
      this.onChangeProp(convertToRaw(content));
    }

    this.setState({ editorState });
  }

  /**
   * Setup keybinds for editor.  (Ctrl + B will bold in windows, for example)
   */
  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChangeEditor(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChangeEditor(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChangeEditor(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChangeEditor(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
  }

  _promptForDecorator(e, decType) {
    e.preventDefault();
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithDecAtBeginning = contentState.getBlockForKey(startKey);
      const decKey = blockWithDecAtBeginning.getEntityAt(startOffset);

      let dec = "";
      if (decKey) {
        const decInstance = contentState.getEntity(decKey);
        dec = decInstance.getData().dec;
      }

      if (decType === "ABBRDATA") {
        this.getTerms();
      }

      this.setState({
        showDecInput: true,
        decValue: dec,
        currentDecType: decType,
      });
    }
  }

  _confirmDecorator(e) {
    e.preventDefault();
    const { editorState, decValue, currentDecType, linkTargetBlank } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(currentDecType, "MUTABLE", {
      dec: decValue,
      isLinkTargetBlank: linkTargetBlank,
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    this.setState(
      {
        editorState: RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey),
        showDecInput: false,
        decValue: "",
      },
      () => {
        setTimeout(() => this.refs.editor.focus(), 0);
      }
    );
  }

  _onDecoratorInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmDecorator(e);
    }
  }

  handleChangeLinkType = () => {
    const { linkTargetBlank, decValue } = this.state;

    if (linkTargetBlank) {
      this.setState({ linkTargetBlank: false });
      this.validateUrl(decValue, false);
    }

    if (!linkTargetBlank) {
      this.setState({ linkTargetBlank: true });
      this.validateUrl(decValue, true);
    }
  };

  handleDecLinkChange = ({ target }) => {
    const { linkTargetBlank } = this.state;
    let url = target.value;

    this.setState({ decValue: url });
    this.validateUrl(url, linkTargetBlank);
  };

  validateUrl = (url, isLinkTargetBlank) => {
    let isValidAbsUrl = isAbsoluteUrl(url);
    let isValidRelUrl = isRootRelativePath(url);

    if ((isLinkTargetBlank && isValidAbsUrl) || (!isLinkTargetBlank && isValidRelUrl)) {
      this.setState({ urlError: false });
    }
    if ((isLinkTargetBlank && !isValidAbsUrl) || (!isLinkTargetBlank && !isValidRelUrl)) {
      this.setState({ urlError: true });
    }
  };

  focusDecoratorInputField = (input) => {
    input.focus();
  };

  /*
   * Custom styling for our readOnly display
   */
  customRoBlockStyles = (contentBlock) => {
    const { classes } = this.props;
    return classes.roGenericBlock;
  };

  /**
   * Retrieve terms from server.
   */
  getTerms = () => {
    this.setState({ termsLoading: true });

    requestTerms({
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let terms = res.data.data;
          let termsForSelect = terms.map((term) => {
            return { value: term.id, label: term.name + " - " + term.id };
          });
          let sortedTerms = sortBy(termsForSelect, ["label", "value"]);

          this.setState({
            terms: sortedTerms,
            termsLoading: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            terms: [],
            termsLoading: false,
          });
          console.error("An error occurred retrieving terms.");
        }
      });
  };

  getConfirmButton = (error) => {
    const { classes } = this.props;
    return (
      <Button
        onMouseDown={this.confirmDecorator}
        variant="contained"
        color="primary"
        className={classes.RichEditorDecButton}
        disabled={error}
      >
        Confirm
      </Button>
    );
  };

  getCancelButton = () => {
    const { classes } = this.props;
    return (
      <Button
        onMouseDown={this.closeDecInput}
        variant="contained"
        color="secondary"
        className={classes.RichEditorDecButton}
      >
        Cancel
      </Button>
    );
  };

  getRemoveButton = () => {
    const { classes } = this.props;
    return (
      <Button
        onMouseDown={this.removeSelectedEntity}
        variant="contained"
        color="primary"
        className={classes.RichEditorDecButton}
      >
        Remove
      </Button>
    );
  };

  removeSelectedEntity = () => {
    const { editorState } = this.state;

    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const contentBlock = contentState.getBlockForKey(startKey);
    const startOffset = selectionState.getStartOffset();
    const entity = contentBlock.getEntityAt(startOffset);

    if (!entity) {
      return;
    }

    let entitySelection = null;

    contentBlock.findEntityRanges(
      (character) => character.getEntity() === entity,
      (start, end) => {
        entitySelection = selectionState.merge({
          anchorOffset: start,
          focusOffset: end,
        });
      }
    );

    const newContentState = Modifier.applyEntity(contentState, entitySelection, null);

    const newEditorState = EditorState.push(editorState, newContentState, "apply-entity");

    this.setState({
      editorState: newEditorState,
      showDecInput: false,
    });
  };

  closeDecInput = () => {
    this.setState({
      showDecInput: false,
    });
  };

  getDecInput = () => {
    const { currentDecType, decValue, terms, termsLoading, urlError, linkTargetBlank } = this.state;
    const { classes } = this.props;

    // For Terms
    if (currentDecType === "ABBRDATA") {
      if (isEmpty(terms) && termsLoading) {
        return <CircularProgress />;
      }
      return (
        <React.Fragment>
          <div className={classes.RichEditorTextFieldContainer}>
            <HgSelect
              className={classes.RichEditorDecSelect}
              placeholder="Select a term"
              aria-label="Select a term"
              maxMenuHeight={220}
              name="term_id"
              isMulti={false}
              options={terms}
              onChange={this.onDecChange}
              value={terms.filter(({ value }) => value === decValue) || ""}
            />
          </div>
          <div className={classes.RichEditorButtonContainer}>
            {this.getCancelButton()}
            {this.getRemoveButton()}
            {this.getConfirmButton()}
          </div>
        </React.Fragment>
      );
    }

    if (currentDecType === "ABBRTITLE") {
      return (
        <React.Fragment>
          <div className={classes.RichEditorTextFieldContainer}>
            <TextField
              onChange={this.onDecChange}
              inputRef={this.focusDecInputField}
              value={this.state.decValue}
              onKeyDown={this.onDecoratorInputKeyDown}
              variant="outlined"
              margin="dense"
              className={classes.RichEditorDecTextField}
            />
          </div>
          <div className={classes.RichEditorButtonContainer}>
            {this.getCancelButton()}
            {this.getRemoveButton()}
            {this.getConfirmButton()}
          </div>
        </React.Fragment>
      );
    }

    if (currentDecType === "LINK") {
      let helperText = "";
      if (urlError && linkTargetBlank) {
        helperText = `Must be an absolute URL (i.e., it must start with "https://")`;
      }
      if (urlError && !linkTargetBlank) {
        helperText = `Must be a root-relative path (i.e., it must start with a slash '/')`;
      }

      return (
        <React.Fragment>
          <div className={classes.RichEditorTextFieldContainer}>
            <TextField
              onChange={this.handleDecLinkChange}
              inputRef={this.focusDecInputField}
              value={this.state.decValue}
              onKeyDown={this.onDecoratorInputKeyDown}
              variant="outlined"
              margin="dense"
              className={classes.RichEditorDecTextField}
              error={urlError}
              helperText={helperText}
            />
          </div>
          <FormControlLabel
            className={classes.RichEditorlinkCheckbox}
            control={<Checkbox checked={linkTargetBlank} onChange={this.handleChangeLinkType} />}
            label="Open in new window"
          />
          <div className={classes.RichEditorButtonContainer}>
            {this.getCancelButton()}
            {this.getRemoveButton()}
            {this.getConfirmButton(urlError)}
          </div>
        </React.Fragment>
      );
    }
  };

  /**
   * Styling for custom inlineStyles
   * @returns {object} styleMap
   */
  getStyleMap = () => {
    return {
      SUBSCRIPT: {
        verticalAlign: "sub",
        fontSize: "smaller",
      },
      SUPERSCRIPT: {
        verticalAlign: "super",
        fontSize: "smaller",
      },
      BOLD: {
        // By default draftJs will use 'bold', but we want
        // a value managed from our style settings that
        // aligns with our other type styles.
        fontWeight: styleVars.txtFontWeightDefaultSemibold,
      },
    };
  };

  render() {
    const { editorState, showDecInput } = this.state;
    const { customToolbarHtml, classes, keyProp, readOnly } = this.props;

    let defaultToolbarConfig = {
      BLOCK_TYPES: [
        { label: "Blockquote", style: "blockquote" },
        { label: "Bullet List", style: "unordered-list-item" },
        { label: "Number List", style: "ordered-list-item" },
      ],
      INLINE_STYLES: [
        { label: "Bold", style: "BOLD" },
        { label: "Italic", style: "ITALIC" },
        { label: "Subscript", style: "SUBSCRIPT" },
        { label: "Superscript", style: "SUPERSCRIPT" },
      ],
      DECORATORS: [
        { label: "Link", style: "LINK" },
        { label: "Tooltip", style: "ABBRTITLE" },
        { label: "Term", style: "ABBRDATA" },
      ],
    };

    let decInput;
    if (showDecInput) {
      decInput = this.getDecInput();
    }

    return (
      <React.Fragment>
        {readOnly && (
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChangeEditor}
            ref="editor"
            customStyleMap={this.getStyleMap()}
            readOnly={true}
            blockStyleFn={this.customRoBlockStyles}
            key={keyProp}
          />
        )}
        {!readOnly && (
          <div className={classes.RichEditorRoot}>
            <div className={classes.RichEditorControls}>
              <InlineStyleControls
                editorState={editorState}
                onToggle={this.toggleInlineStyle}
                classes={classes}
                allowedHtml={
                  customToolbarHtml
                    ? customToolbarHtml.INLINE_STYLES
                    : defaultToolbarConfig.INLINE_STYLES
                }
              />
              <BlockStyleControls
                editorState={editorState}
                onToggle={this.toggleBlockType}
                classes={classes}
                allowedHtml={
                  customToolbarHtml
                    ? customToolbarHtml.BLOCK_TYPES
                    : defaultToolbarConfig.BLOCK_TYPES
                }
              />
              <DecoratorControls
                editorState={editorState}
                promptForDecorator={this.promptForDecorator}
                classes={classes}
                allowedHtml={
                  customToolbarHtml ? customToolbarHtml.DECORATORS : defaultToolbarConfig.DECORATORS
                }
              />
            </div>
            {decInput}
            <div className={classes.RichEditorEditor} onClick={this.focus}>
              <Editor
                editorState={this.state.editorState}
                onChange={this.onChangeEditor}
                ref="editor"
                customStyleMap={this.getStyleMap()}
                key={keyProp}
                handleKeyCommand={this.handleKeyCommand}
                stripPastedStyles={true}
              />
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

/*
 * MaterialUi Styles
 */
const styles = (theme) => ({
  RichEditorRoot: {
    background: "#eee",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  RichEditorEditor: {
    backgroundColor: "#fff",
    borderTop: "1px solid #ddd",
    cursor: "text",
    fontSize: "14px",
    minHeight: "100px",
    padding: theme.spacing(1, 0.5),
  },
  RichEditorControls: {
    fontSize: "11px",
    margin: theme.spacing(0.5),
    userSelect: "none",
    textTransform: "uppercase",
  },
  RichEditorStyleButton: {
    backgroundColor: "#dedede",
    color: "#444",
    cursor: "pointer",
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    margin: theme.spacing(0.25, 0.5, 0.25, 0.25),
    padding: "1px 2px",
    display: "inline-block",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
  RichEditorActiveButton: {
    backgroundColor: "#fff",
    color: styleVars.colorPrimaryWithMoreContrast,
  },
  RichEditorButtonContainer: {
    margin: "auto",
    width: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  RichEditorDecTextField: {
    width: "90%",
    padding: theme.spacing(),
    margin: "0 auto",
  },
  RichEditorDecButton: {
    padding: theme.spacing(),
    margin: theme.spacing(2),
  },
  RichEditorTextFieldContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  RichEditorlinkCheckbox: {
    marginLeft: theme.spacing(2),
  },
  RichEditorDecSelect: {
    width: "90%",
    padding: theme.spacing(),
    margin: "0 auto",
  },

  // READ-ONLY MODE STYLES
  // ---------------------
  // Note: most of the markup styles should automatically
  // be applied by the app stylesheet. Avoid customizations
  // below that conflict with the normal semantic HTML styles.
  roGenericBlock: {
    // Adjust the styling of the <br> so it's closer to
    // what a standard paragraph margin would be (since
    // we don't have actual <p> tags in Draft.js).
    "& br": {
      content: '" "',
      display: "block",
      marginTop: styleVars.txtMarginBottomP,
    },
  },
});

export default withStyles(styles, { withTheme: true })(DraftEditor);
