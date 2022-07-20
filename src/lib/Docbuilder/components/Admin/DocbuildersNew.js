import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isEmpty } from "lodash";
import { requestCreateDocbuilder } from "../../requests";
import generateTitle from "utils/generateTitle";
import isUrlSlug from "utils/isUrlSlug";
import isMachineName from "utils/isMachineName";
import { Button, CircularProgress, FormControl, Grid, Paper, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import HgTextField from "components/ui/HgTextField";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * New Docubuilder admin page functional component
 */
export default function DocbuilderNew({ denylist }) {
  const [name, setName] = useState("");
  const [machineName, setMachineName] = useState("");
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
      isEmpty(slug) || isEmpty(machineName) || isEmpty(name) || !validSlug || !validMachineName
    );
  };

  /**
   * Create docbuilder
   * @param {object} event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    requestCreateDocbuilder({
      name,
      slug,
      machine_name: machineName,
      public: false,
    }).then((res) => {
      if (201 === res.status) {
        let docbuilder = res.data.data;
        setSaving(false);
        hgToast(`${docbuilder.name} saved successfully`);
        history.push(`/app/admin/docbuilders/${docbuilder.id}`);
      } else {
        console.error("An error occurred saving docbuilder");
        setSaving(false);
      }
    });
  };

  // Set title
  useEffect(() => {
    generateTitle("New Docbuilder");
  }, []);

  return (
    <React.Fragment>
      <Breadcrumbs>
        <Breadcrumb path="/app/admin/docbuilders" root>
          Docbuilders Management
        </Breadcrumb>
        <Breadcrumb path={`/app/admin/docbuilders/new`}>New</Breadcrumb>
      </Breadcrumbs>
      <h1>New Docbuilder</h1>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {/* Name */}
              <FormControl fullWidth variant="standard">
                <div className={classes.textFieldContainer}>
                  <HgTextField
                    placeholder="New Docbuilder"
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
                <div>
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
