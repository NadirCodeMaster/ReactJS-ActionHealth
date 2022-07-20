import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isEmpty } from "lodash";
import { requestCreateSubsection } from "../../requests";
import generateTitle from "utils/generateTitle";
import isMachineName from "utils/isMachineName";
import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import TextField from "components/ui/HgTextField";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * New Docubuilder Subsection admin page functional component
 */
export default function DocbuilderSubSectionsNew({ docbuilderId, sectionId, denylist }) {
  const [machineName, setMachineName] = useState("");
  const [validMachineName, setValidMachineName] = useState(true);
  const [builderHeadline, setBuilderHeadline] = useState("");
  const [builderPrimaryText, setBuilderPrimaryText] = useState("");
  const [builderSecondaryText, setBuilderSecondaryText] = useState("");
  const [docText, setDocText] = useState("");
  const [weight, setWeight] = useState(0);
  const [exclude, setExclude] = useState(false);
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
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
    return (
      isEmpty(machineName) ||
      isEmpty(builderHeadline) ||
      isEmpty(builderPrimaryText) ||
      isEmpty(builderSecondaryText) ||
      isEmpty(docText) ||
      !validMachineName
    );
  };

  /**
   * create docbuilder subsection
   * @param {object} event
   */
  const handleSubmit = (e) => {
    //@TODO for some reason returns 404 error, need to investigate/ talk with BE
    e.preventDefault();
    setSaving(true);
    requestCreateSubsection({
      docbuilder_section_id: sectionId,
      machine_name: machineName,
      builder_headline: builderHeadline,
      builder_primary_text: builderPrimaryText,
      builder_secondary_text: builderSecondaryText,
      doc_text: docText,
      weight,
      required,
      exclude_from_builder: exclude,
    }).then((res) => {
      if (201 === res.status) {
        let subsection = res.data.data;
        setSaving(false);
        hgToast(`${subsection.name} saved successfully`);
        history.push(
          `/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsection.id}`
        );
      } else {
        console.error("An error occurred saving new docbuilder section");
        setSaving(false);
      }
    });
  };

  // Set title
  useEffect(() => {
    generateTitle("New Docbuilder Subection");
  }, []);

  return (
    <React.Fragment>
      <Breadcrumbs>
        <Breadcrumb path="/app/admin/docbuilders/" root>
          Docbuilders Management
        </Breadcrumb>
        <Breadcrumb path={`/app/admin/docbuilders/${docbuilderId}`}>
          Docbuilder {docbuilderId}
        </Breadcrumb>
        <Breadcrumb path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}`}>
          Section {sectionId}
        </Breadcrumb>
        <Breadcrumb
          path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/new`}
        >
          New
        </Breadcrumb>
      </Breadcrumbs>
      <h1>New Subsection</h1>
      <div className={classes.textFieldContainer}>
        Create a new subsection in Docbuilder {docbuilderId}
      </div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {/* Name */}
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
                    required
                    multiline
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
                {saving && (
                  <React.Fragment>
                    &nbsp;
                    <CircularProgress size="1em" />
                  </React.Fragment>
                )}
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  textFieldContainer: {
    marginBottom: theme.spacing(),
  },
  saveContainer: {
    marginTop: theme.spacing(),
  },
}));
