import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { isEmpty, map } from "lodash";
import { requestCreateQuestion } from "../../requests";
import generateTitle from "utils/generateTitle";
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
import validateQuestionValue from "../../utils/question/validateQuestionValue";
import HgSelect from "components/ui/HgSelect";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import HgTextField from "components/ui/HgTextField";
import TextArea from "components/ui/TextArea";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * New Docubuilder Question admin page functional component
 */
export default function DocbuilderQuestionsNew({ docbuilderId, sectionId, subsectionId }) {
  const [type, setType] = useState();
  const [value, setValue] = useState();
  const [valueErrors, setValueErrors] = useState([]);
  const [weight, setWeight] = useState(0);
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const docbuilderQuestionTypes = useSelector(
    (state) => state.app_meta.data.docbuilderQuestionTypes
  );

  const disableSave = () => {
    return !isEmpty(valueErrors);
  };

  const questionTypeSelectOptions = () => {
    return map(docbuilderQuestionTypes, (qt) => {
      return {
        value: qt.id,
        label: qt.name,
      };
    });
  };

  /**
   * Validates json textarea object against schemas, and sets errors for user
   * @param {string} textAreaValue (gets converted to object in validation)
   * @param {string} selectType
   */
  const validateAndSetValueErrors = (textAreaValue = value, selectType = type) => {
    let valueErrorsJsx;
    let valueErrorsArray = validateQuestionValue(selectType, textAreaValue);

    if (!isEmpty(valueErrorsArray)) {
      valueErrorsJsx = valueErrorsArray.map((ve, index) => {
        return (
          <span style={{ display: "block" }} key={index}>
            {ve.message}
          </span>
        );
      });
    }

    setValueErrors(valueErrorsJsx);
  };

  const handleTextAreaChange = (textAreaValue = value) => {
    validateAndSetValueErrors(textAreaValue, undefined);
    setValue(textAreaValue);
  };

  const handleSelectChange = (selectType) => {
    setType(selectType);
    validateAndSetValueErrors(undefined, selectType);
  };

  /**
   * create docbuilder section
   * @param {object} event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    requestCreateQuestion({
      docbuilder_question_type_id: type,
      docbuilder_subsection_id: subsectionId,
      value,
      weight,
      required,
    }).then((res) => {
      if (201 === res.status) {
        let question = res.data.data;
        setSaving(false);
        hgToast(`${question.id} saved successfully`);
        history.push(
          `/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}/questions/${question.id}`
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
    <Fragment>
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
          path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}/`}
        >
          Subsection {subsectionId}
        </Breadcrumb>
        <Breadcrumb
          path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsection/${subsectionId}/questions/new`}
        >
          New
        </Breadcrumb>
      </Breadcrumbs>
      <h1>New Question</h1>
      <div className={classes.textFieldContainer}>
        Create a new question in Docbuilder {docbuilderId}
      </div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {/* Name */}
              <FormControl fullWidth variant="standard">
                <div className={classes.textFieldContainer}>
                  <HgSelect
                    placeholder="Question Type"
                    aria-label="Question Type"
                    name="question_type"
                    options={questionTypeSelectOptions()}
                    value={questionTypeSelectOptions().filter(({ value }) => value === type) || ""}
                    onChange={(e) => handleSelectChange(e.value)}
                  />
                  <TextArea
                    label="Value"
                    name="value"
                    id="docbuilder_new_question_value"
                    value={value}
                    onChange={(e) => handleTextAreaChange(e.target.value)}
                    fullWidth
                    required
                    rows={20}
                    error={!isEmpty(valueErrors)}
                    helperText={isEmpty(valueErrors) ? "" : valueErrors}
                    InputProps={{
                      style: {
                        fontFamily: `courier new, courier, monospace`,
                        fontWeight: styleVars.txtFontWeightDefaultMedium,
                        padding: theme.spacing(),
                      },
                    }}
                    variant={"outlined"}
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
                  <Fragment>
                    &nbsp;
                    <CircularProgress size="1em" />
                  </Fragment>
                )}
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>
    </Fragment>
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
