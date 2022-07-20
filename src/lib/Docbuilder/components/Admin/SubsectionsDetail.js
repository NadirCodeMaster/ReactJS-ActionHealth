import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isEmpty } from "lodash";
import {
  requestSubsection,
  requestUpdateSubsection,
  requestDeleteSubsection,
} from "../../requests";
import generateTitle from "utils/generateTitle";
import isMachineName from "utils/isMachineName";
import { Link } from "react-router-dom";
import {
  Button,
  FormControl,
  FormControlLabel,
  Icon,
  Grid,
  Paper,
  Switch,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import HgTextField from "components/ui/HgTextField";
import HgSkeleton from "components/ui/HgSkeleton";
import Questions from "./QuestionsList";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Admin subsection detail docbuilder functional component
 */
export default function DocbuilderSubSectionsDetail({
  docbuilderId,
  sectionId,
  subsectionId,
  denylist,
}) {
  const [machineName, setMachineName] = useState("");
  const [validMachineName, setValidMachineName] = useState(true);
  const [builderHeadline, setBuilderHeadline] = useState("");
  const [builderPrimaryText, setBuilderPrimaryText] = useState("");
  const [builderSecondaryText, setBuilderSecondaryText] = useState("");
  const [docText, setDocText] = useState("");
  const [weight, setWeight] = useState(0);
  const [exclude, setExclude] = useState(false);
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const handleChangeMachineName = ({ target }) => {
    if (isMachineName(target.value) && !denylist.some((r) => target.value.includes(r))) {
      setValidMachineName(true);
    } else {
      setValidMachineName(false);
    }

    setMachineName(target.value);
  };

  const disableSave = () => {
    return isEmpty(machineName) || isEmpty(builderHeadline) || !validMachineName;
  };

  /**
   * Update docbuilder subsection
   * @param {object} event
   */
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    requestUpdateSubsection(
      {
        machine_name: machineName,
        builder_headline: builderHeadline,
        builder_primary_text: builderHeadline,
        builder_secondary_text: builderHeadline,
        doc_text: docText,
        weight,
        required,
        exclude_from_builder: exclude,
      },
      subsectionId
    ).then((res) => {
      if (200 === res.status) {
        let subsection = res.data.data;
        setLoading(false);
        setMachineName(subsection.machine_name);
        setBuilderHeadline(subsection.builder_headline);
        setBuilderPrimaryText(subsection.builder_primary_text);
        setBuilderSecondaryText(subsection.builder_secondary_text);
        setDocText(subsection.doc_text);
        setWeight(subsection.weight);
        setRequired(subsection.required || false);
        setExclude(subsection.exclude_from_builder || false);
        hgToast(`${subsection.machine_name} updated successfully`);
      } else {
        console.error("An error occurred saving docbuilder");
        setLoading(false);
      }
    });
  };

  /**
   * delete docbuilder subsection
   * @param {object} event
   */
  const handleDelete = (e) => {
    setLoading(true);
    requestDeleteSubsection(subsectionId).then((res) => {
      if (204 === res.status) {
        setLoading(false);
        hgToast(`${machineName} deleted successfully`);
        history.push(`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}`);
      } else {
        console.error("An error occurred deleting docbuilder subsection");
        setLoading(false);
      }
    });
  };

  // Fetch docbuilder subsection
  useEffect(() => {
    setLoading(true);
    requestSubsection(subsectionId).then((res) => {
      if (200 === res.status) {
        let subsection = res.data.data;
        setLoading(false);
        setLoaded(true);
        setMachineName(subsection.machine_name);
        setBuilderHeadline(subsection.builder_headline);
        setBuilderPrimaryText(subsection.builder_primary_text);
        setBuilderSecondaryText(subsection.builder_secondary_text);
        setDocText(subsection.doc_text);
        setWeight(subsection.weight);
        setRequired(subsection.required || false);
        setExclude(subsection.exclude_from_builder || false);
      } else {
        console.error("An error occurred deleting docbuilder");
        setLoading(false);
      }
    });
  }, [docbuilderId, sectionId, subsectionId]);

  // Set title
  useEffect(() => {
    let docbuilderTitle =
      "Docbuilder " + docbuilderId + " Section " + sectionId + " Subsction " + subsectionId;
    generateTitle(docbuilderTitle);
  }, [docbuilderId, sectionId, subsectionId]);

  return (
    <React.Fragment>
      <Breadcrumbs>
        <Breadcrumb path="/app/admin/docbuilders" root>
          Docbuilders Management
        </Breadcrumb>
        <Breadcrumb path={`/app/admin/docbuilders/${docbuilderId}`}>
          Docbuilder {docbuilderId}
        </Breadcrumb>
        <Breadcrumb path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}`}>
          Section {sectionId}
        </Breadcrumb>
        <Breadcrumb
          path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}`}
        >
          Subsection {subsectionId}
        </Breadcrumb>
      </Breadcrumbs>
      <h1>Subsection Detail</h1>
      <form onSubmit={handleSave}>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {(loading || !loaded) && (
                <Fragment>
                  <div className={classes.fauxTextFieldContainer}>
                    <HgSkeleton variant="rect" height={theme.spacing(4)} />
                  </div>
                  <div className={classes.fauxTextFieldContainer}>
                    <HgSkeleton variant="rect" height={theme.spacing(4)} />
                  </div>
                  <div className={classes.fauxTextFieldContainer}>
                    <HgSkeleton variant="rect" height={theme.spacing(4)} />
                  </div>
                  <HgSkeleton variant="rect" width={theme.spacing(4)} />
                </Fragment>
              )}
              {!loading && loaded && (
                <FormControl fullWidth variant="standard">
                  <div className={classes.textFieldContainer}>
                    <HgTextField
                      placeholder="Machine Name"
                      label="Machine Name"
                      name="machine_name"
                      id="machine_name"
                      value={machineName}
                      onChange={handleChangeMachineName}
                      error={!validMachineName}
                      helperText={"Only lowercase and underscores (EX: valid_machine_name)"}
                      fullWidth
                      required
                    />
                  </div>
                  <div className={classes.textFieldContainer}>
                    <HgTextField
                      placeholder="Builder Headline"
                      label="Builder Headline"
                      name="builder_headline"
                      id="builder_headline"
                      value={builderHeadline}
                      onChange={(e) => setBuilderHeadline(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>
                  <div className={classes.textFieldContainer}>
                    <HgTextField
                      placeholder="Builder Primary Text"
                      label="Builder Primary Text"
                      name="builder_primary_text"
                      id="builder_primary_text"
                      value={builderPrimaryText}
                      onChange={(e) => setBuilderPrimaryText(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>
                  <div className={classes.textFieldContainer}>
                    <HgTextField
                      placeholder="Builder Secondary Text"
                      label="Builder Secondary Text"
                      name="builder_secondary_text"
                      id="builder_secondary_text"
                      value={builderSecondaryText}
                      onChange={(e) => setBuilderSecondaryText(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>
                  <div className={classes.textFieldContainer}>
                    <HgTextField
                      placeholder="Doc Text"
                      label="Doc Text"
                      name="doc_text"
                      id="doc_text"
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                      fullWidth
                      multiline
                      required
                    />
                  </div>
                  <div className={classes.textFieldContainer}>
                    <HgTextField
                      label="Sorting Weight"
                      name="weight"
                      id="weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0"
                      type="number"
                      fullWidth
                      required
                    />
                  </div>
                  {/* Exclude */}
                  <div>
                    <FormControlLabel
                      control={
                        <Switch
                          name="exclude"
                          value="exclude"
                          checked={exclude}
                          onChange={(e) => setExclude(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Exclude from builder"
                    />
                  </div>
                  {/* Required */}
                  <div>
                    <FormControlLabel
                      control={
                        <Switch
                          name="required"
                          value="required"
                          checked={required}
                          onChange={(e) => setRequired(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Required"
                    />
                  </div>
                </FormControl>
              )}
            </Paper>

            {/* Save Button */}
            <div className={classes.saveContainer}>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                type="submit"
                fullWidth
                disabled={disableSave()}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (window.confirm("Are you sure?")) {
                    handleDelete();
                  }
                }}
                className={classes.button}
                disabled={loading}
                fullWidth
              >
                Delete
              </Button>
            </div>
            <h2>
              Questions
              <Button
                color="primary"
                component={Link}
                size="small"
                className={classes.addButton}
                to={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}/questions/new`}
              >
                <Icon color="primary" style={{ marginRight: "4px" }}>
                  add_circle
                </Icon>
                Add
              </Button>
            </h2>
            <Paper>
              <Questions
                subsectionId={subsectionId}
                sectionId={sectionId}
                docbuilderId={docbuilderId}
              />
            </Paper>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    marginBottom: theme.spacing(),
  },
  textFieldContainer: {
    marginBottom: theme.spacing(),
  },
  fauxTextFieldContainer: {
    marginBottom: theme.spacing(4),
  },
  saveContainer: {
    marginTop: theme.spacing(),
  },
}));
