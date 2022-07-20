import React, { Fragment, useContext, useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { useHistory } from "react-router";
import { requestSection, requestUpdateSection, requestDeleteSection } from "../../requests";
import generateTitle from "utils/generateTitle";
import isUrlSlug from "utils/isUrlSlug";
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
import Subsections from "./SubsectionsList";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Admin detail docbuilder functional component
 */
export default function DocbuilderSectionsDetail({ docbuilderId, sectionId, denylist }) {
  const [machineName, setMachineName] = useState("");
  const [slug, setSlug] = useState("");
  const [weight, setWeight] = useState(0);
  const [builderHeadline, setBuilderHeadline] = useState("");
  const [docHeadline, setDocHeadline] = useState("");
  const [meta, setMeta] = useState(false);
  const [numbered, setNumbered] = useState(false);
  const [validMachineName, setValidMachineName] = useState(true);
  const [validSlug, setValidSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
   * Update docbuilder section
   * @param {object} event
   */
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    requestUpdateSection(
      {
        machine_name: machineName,
        slug,
        weight,
        builder_headline: builderHeadline,
        doc_headline: docHeadline,
        is_numbered: numbered,
        is_meta: meta,
      },
      sectionId
    ).then((res) => {
      if (200 === res.status) {
        let section = res.data.data;
        setLoading(false);
        setMachineName(section.machine_name);
        setSlug(section.slug);
        setWeight(section.weight);
        setBuilderHeadline(section.builder_headline);
        setDocHeadline(section.doc_headline);
        setNumbered(section.is_numbered || false);
        setMeta(section.is_meta || false);
        hgToast(`${section.machine_name} updated successfully`);
      } else {
        console.error("An error occurred saving docbuilder");
        setLoading(false);
      }
    });
  };

  /**
   * delete docbuilder section
   * @param {object} event
   */
  const handleDelete = (e) => {
    setLoading(true);
    requestDeleteSection(sectionId).then((res) => {
      if (204 === res.status) {
        setLoading(false);
        hgToast(`${machineName} deleted successfully`);
        history.push(`/app/admin/docbuilders/${docbuilderId}`);
      } else {
        console.error("An error occurred deleting docbuilder section");
        setLoading(false);
      }
    });
  };

  // Fetch docbuilder section
  useEffect(() => {
    setLoading(true);
    requestSection(sectionId).then((res) => {
      if (200 === res.status) {
        let section = res.data.data;
        setLoaded(true);
        setLoading(false);
        setMachineName(section.machine_name);
        setSlug(section.slug);
        setWeight(section.weight);
        setBuilderHeadline(section.builder_headline);
        setDocHeadline(section.doc_headline);
        setNumbered(section.is_numbered || false);
        setMeta(section.is_meta || false);
      } else {
        console.error("An error occurred deleting docbuilder");
        setLoading(false);
      }
    });
  }, [docbuilderId, sectionId]);

  // Set title
  useEffect(() => {
    let docbuilderTitle = "Docbuilder " + docbuilderId + " Section " + sectionId;
    generateTitle(docbuilderTitle);
  }, [docbuilderId, sectionId]);

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
      </Breadcrumbs>
      <h1>Section Detail</h1>
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
              Subsections
              <Button
                color="primary"
                component={Link}
                size="small"
                className={classes.addButton}
                to={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/new`}
              >
                <Icon color="primary" style={{ marginRight: "4px" }}>
                  add_circle
                </Icon>
                Add
              </Button>
            </h2>
            <Paper>
              <Subsections sectionId={sectionId} docbuilderId={docbuilderId} />
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
