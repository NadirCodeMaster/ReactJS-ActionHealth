import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { find, isEmpty, map } from "lodash";
import { requestQuestions, requestUpdateQuestion, requestDeleteQuestion } from "../../requests";
import generateTitle from "utils/generateTitle";
import {
  Button,
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
import HgSkeleton from "components/ui/HgSkeleton";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Admin question detail docbuilder functional component
 */
export default function DocbuilderQuestionsDetail({
  docbuilderId,
  sectionId,
  subsectionId,
  questionId,
}) {
  const [type, setType] = useState(null);
  const [value, setValue] = useState("");
  const [valueErrors, setValueErrors] = useState([]);
  const [weight, setWeight] = useState(0);
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
   * Update docbuilder question
   * @param {object} event
   */
  const handleSave = (e) => {
    e.preventDefault();

    setLoading(true);
    requestUpdateQuestion(
      {
        docbuilder_question_type_id: type,
        value: JSON.parse(value),
        weight,
        required,
      },
      questionId
    ).then((res) => {
      if (200 === res.status) {
        let question = res.data.data;
        setLoading(false);
        setType(question.docbuilder_question_type_id);
        setValue(JSON.stringify(question.value, null, 2));
        setRequired(question.required);
        hgToast(`${question.id} updated successfully`);
      } else {
        console.error("An error occurred saving docbuilder");
        setLoading(false);
      }
    });
  };

  /**
   * delete docbuilder question
   * @param {object} event
   */
  const handleDelete = (e) => {
    setLoading(true);
    requestDeleteQuestion(questionId).then((res) => {
      if (204 === res.status) {
        setLoading(false);
        hgToast(`Question ${questionId} deleted successfully`);
        history.push(
          `/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}`
        );
      } else {
        console.error("An error occurred deleting docbuilder question");
        setLoading(false);
      }
    });
  };

  // Fetch docbuilder question
  useEffect(() => {
    setLoading(true);
    requestQuestions({
      docbuilder_id: docbuilderId,
      docbuilder_section_id: sectionId,
      docbuilder_subsection_id: subsectionId,
    }).then((res) => {
      if (200 === res.status) {
        let question = find(res.data.data, { id: questionId });
        setLoading(false);
        setLoaded(true);
        setType(question.docbuilder_question_type_id);
        setValue(JSON.stringify(question.value, null, 2));
        setRequired(question.required);
      } else {
        console.error("An error occurred deleting docbuilder");
        setLoading(false);
      }
    });
  }, [docbuilderId, sectionId, subsectionId, questionId]);

  // Set title
  useEffect(() => {
    let docbuilderTitle = "Question " + questionId;
    generateTitle(docbuilderTitle);
  }, [questionId]);

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
        <Breadcrumb
          path={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}/questions/${questionId}`}
        >
          Question {questionId}
        </Breadcrumb>
      </Breadcrumbs>
      <h1>Question Detail</h1>
      <div className={classes.textFieldContainer}>Question {questionId}</div>
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
                    <HgSelect
                      placeholder="Question Type"
                      aria-label="Question Type"
                      name="question_type"
                      options={questionTypeSelectOptions()}
                      value={
                        questionTypeSelectOptions().filter(({ value }) => value === type) || ""
                      }
                      onChange={(e) => handleSelectChange(e.value)}
                    />
                    <TextArea
                      label="Value"
                      name="value"
                      id="value"
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
