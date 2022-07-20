import React from "react";
import PropTypes from "prop-types";
import { FormControl, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import HgTextField from "components/ui/HgTextField";
import styleVars from "style/_vars.scss";

export default function FileUploadItem({
  disabled,
  fileId,
  fileUrl,
  itemNumber,
  name,
  nameChangeHandler,
  removeItemFn,
}) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <Grid
        justifyContent="center"
        alignItems="center"
        container
        spacing={1}
        className={classes.colNameFile}
      >
        <Grid item xs={10}>
          <FormControl
            required={true}
            className={classes.formControlForName}
            fullWidth
            variant="standard"
          >
            <HgTextField
              inputProps={{ maxLength: 255 }}
              disabled={disabled}
              required
              label={`Title of upload #${itemNumber}`}
              name="name"
              id={`file_upload_name_${fileId}`}
              value={name}
              onChange={(e) => nameChangeHandler(e, fileId)}
              variant="outlined"
              fullWidth
            />
          </FormControl>
        </Grid>
        <Grid item xs={1} className={classes.colViewFile}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            view
          </a>
        </Grid>
        <Grid item xs={1} className={classes.colRemoveFile}>
          <ConfirmButton
            className={classes.removeButton}
            onConfirm={() => removeItemFn(fileId)}
            disabled={disabled}
            title="Are you sure you want to remove this file?"
            aria-label="Remove file"
          >
            <RemoveCircleOutlineIcon />
          </ConfirmButton>
        </Grid>
      </Grid>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {},
  colNameFile: { textAlign: "left" },
  colViewFile: { textAlign: "left" },
  colRemoveFile: {
    textAlign: "right",
  },
  removeButton: {
    color: styleVars.colorDarkGray,
    "&:hover": {
      backgroundColor: "transparent",
    },
    minWidth: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

FileUploadItem.propTypes = {
  disabled: PropTypes.bool,
  fileId: PropTypes.number.isRequired,
  fileUrl: PropTypes.string.isRequired,
  itemNumber: PropTypes.number.isRequired,
  name: PropTypes.string,
  nameChangeHandler: PropTypes.func.isRequired,
  removeItemFn: PropTypes.func.isRequired,
};
