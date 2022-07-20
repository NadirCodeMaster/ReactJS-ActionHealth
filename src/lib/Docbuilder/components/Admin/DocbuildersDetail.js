import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isEmpty } from "lodash";
import {
  requestDocbuilder,
  requestUpdateDocbuilder,
  requestDeleteDocbuilder,
} from "../../requests";
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
import Sections from "./SectionsList.js";
import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Admin detail docbuilder functional component
 */
export default function DocbuilderDetail({ docbuilderId, denylist }) {
  const [name, setName] = useState("");
  const [machineName, setMachineName] = useState("");
  const [validMachineName, setValidMachineName] = useState(true);
  const [slug, setSlug] = useState("");
  const [validSlug, setValidSlug] = useState(true);
  const [published, setPublished] = useState(false);
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
      isEmpty(slug) || isEmpty(machineName) || isEmpty(name) || !validSlug || !validMachineName
    );
  };

  /**
   * Update docbuilder
   * @param {object} event
   */
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    requestUpdateDocbuilder(
      {
        name,
        slug,
        machine_name: machineName,
        public: published,
      },
      docbuilderId
    ).then((res) => {
      if (200 === res.status) {
        let docbuilder = res.data.data;
        setLoading(false);
        setName(docbuilder.name);
        setMachineName(docbuilder.machine_name);
        setSlug(docbuilder.slug);
        setPublished(docbuilder.public || false);
        hgToast(`${docbuilder.name} updated successfully`, "success");
      } else {
        hgToast("An error occurred saving docbuilder", "error");
        setLoading(false);
      }
    });
  };

  /**
   * delete docbuilder
   * @param {object} event
   */
  const handleDelete = (e) => {
    setLoading(true);
    requestDeleteDocbuilder(docbuilderId).then((res) => {
      if (204 === res.status) {
        setLoading(false);
        hgToast(`${name} deleted successfully`, "success");
        history.push(`/app/admin/docbuilders/`);
      } else {
        hgToast("An error occurred deleting docbuilder", "error");
        setLoading(false);
      }
    });
  };

  // Fetch docbuilder
  useEffect(() => {
    setLoading(true);
    requestDocbuilder(docbuilderId).then((res) => {
      if (200 === res.status) {
        let docbuilder = res.data.data;
        setLoading(false);
        setName(docbuilder.name);
        setMachineName(docbuilder.machine_name);
        setSlug(docbuilder.slug);
        setPublished(docbuilder.public || false);
        setLoaded(true);
      } else {
        hgToast("An error occurred fetching docbuilder", "error");
        setLoading(false);
      }
    });
  }, [docbuilderId]);

  // Set title
  useEffect(() => {
    let docbuilderTitle = "Docbuilder " + docbuilderId;
    generateTitle(docbuilderTitle);
  }, [docbuilderId]);

  return (
    <React.Fragment>
      <Breadcrumbs>
        <Breadcrumb path="/app/admin/docbuilders" root>
          Docbuilders Management
        </Breadcrumb>
        <Breadcrumb path={`/app/admin/docbuilders/${docbuilderId}`}>{docbuilderId}</Breadcrumb>
      </Breadcrumbs>
      <h1>Docbuilder Detail</h1>
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
                      placeholder="Docbuilder Name"
                      label="Name"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>
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
                  {/* Published */}
                  <div>
                    <FormControlLabel
                      control={
                        <Switch
                          name="published"
                          value="published"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Published"
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
              Sections
              <Button
                color="primary"
                component={Link}
                size="small"
                className={classes.addButton}
                to={`/app/admin/docbuilders/${docbuilderId}/sections/new`}
              >
                <Icon color="primary" style={{ marginRight: "4px" }}>
                  add_circle
                </Icon>
                Add
              </Button>
            </h2>
            <Paper>
              <Sections docbuilderId={docbuilderId} />
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
