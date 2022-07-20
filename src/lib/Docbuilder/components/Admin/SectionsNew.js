import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isEmpty } from "lodash";
import { requestCreateSection } from "../../requests";
import generateTitle from "utils/generateTitle";
import isUrlSlug from "utils/isUrlSlug";
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
import HgTextField from "components/ui/HgTextField";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * New Docubuilder admin page functional component
 */
export default function DocbuilderSectionsNew({ docbuilderId, denylist }) {
  const [builderHeadline, setBuilderHeadline] = useState("");
  const [docHeadline, setDocHeadline] = useState("");
  const [machineName, setMachineName] = useState("");
  const [meta, setMeta] = useState(false);
  const [numbered, setNumbered] = useState(false);
  const [validMachineName, setValidMachineName] = useState(true);
  const [slug, setSlug] = useState("");
  const [validSlug, setValidSlug] = useState(true);
  const [saving, setSaving] = useState(false);
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const handleChangeSlug = ({ target }) => {
    if (isUrlSlug(target.value) && !denylist.some((r) => target.value.includes(r))) {
      setValidSlug(true);
    } else {
      setValidSlug(false);
    }

    setSlug(target.value);
  };

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
      isEmpty(slug) ||
      isEmpty(machineName) ||
      isEmpty(builderHeadline) ||
      isEmpty(docHeadline) ||
      !validSlug ||
      !validMachineName
    );
  };

  /**
   * create docbuilder section
   * @param {object} event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    requestCreateSection({
      docbuilder_id: docbuilderId,
      machine_name: machineName,
      slug,
      builder_headline: builderHeadline,
      doc_headline: docHeadline,
      is_numbered: numbered,
      is_meta: meta,
      weight: 0,
    }).then((res) => {
      if (201 === res.status) {
        let section = res.data.data;
        setSaving(false);
        hgToast(`${section.machine_name} saved successfully`);
        history.push(`/app/admin/docbuilders/${docbuilderId}/sections/${section.id}`);
      } else {
        console.error("An error occurred saving new docbuilder section");
        setSaving(false);
      }
    });
  };

  // Set title
  useEffect(() => {
    generateTitle("New Docbuilder Section");
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
        <Breadcrumb path={`/app/admin/docbuilders/${docbuilderId}/sections/new`}>New</Breadcrumb>
      </Breadcrumbs>
      <h1>New Section</h1>
      <div className={classes.textFieldContainer}>
        Create a new section in Docbuilder {docbuilderId}
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
                    placeholder="Slug"
                    label="Slug"
                    name="slug"
                    id="slug"
                    value={slug}
                    onChange={handleChangeSlug}
                    error={!validSlug}
                    helperText={"Only lowercase and dashses (EX: valid-slug)"}
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
                    placeholder="Doc Headline"
                    label="Doc Headline"
                    name="doc_headline"
                    id="doc_headline"
                    value={docHeadline}
                    onChange={(e) => setDocHeadline(e.target.value)}
                    fullWidth
                    required
                  />
                </div>
                {/* Numbered */}
                <div>
                  <FormControlLabel
                    control={
                      <Switch
                        name="numbered"
                        value="numbered"
                        checked={numbered}
                        onChange={(e) => setNumbered(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Numbered"
                  />
                </div>
                {/* Meta */}
                <div>
                  <FormControlLabel
                    control={
                      <Switch
                        name="meta"
                        value="meta"
                        checked={meta}
                        onChange={(e) => setMeta(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Meta"
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
