import React, { useRef, useState } from "react";
import { isEmpty } from "lodash";
import { Button, FormLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Checkbox from "components/ui/CheckboxWrapper";
import RadioGroupBuilder from "components/ui/RadioGroupBuilder";
import HgTextValidator from "components/ui/HgTextValidator";
import { ValidatorForm } from "react-material-ui-form-validator";
import { isEmailMessage, requiredMessage } from "form_utils";
import styleVars from "style/_vars.scss";

export default function SoftGateForm({ handleSubmit }) {
  const classes = useStyles();
  const emailRef = useRef(null);
  const [values, setValues] = useState({
    email: "",
    role: "",
    subscribe: false,
    terms: false,
  });

  const handleBlur = (e) => {
    const { value } = e.target;
    emailRef.current.validate(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleChangeCheckbox = (e) => {
    const { name, checked } = e.target;
    setValues({ ...values, [name]: checked });
  };

  const onSubmit = () => {
    handleSubmit(values);
  };

  const isSubmitDisabled = () => {
    return isEmpty(values.email) || isEmpty(values.role) || !values.subscribe || !values.terms;
  };

  return (
    <div>
      <ValidatorForm onSubmit={onSubmit} autoComplete="on" instantValidate={false}>
        <div className={classes.emailTextfield}>
          <HgTextValidator
            ref={emailRef}
            name={"email"}
            autoComplete="email"
            label={"Email: *"}
            type="email"
            id="email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
            validators={["required", "isEmail"]}
            errorMessages={[requiredMessage, isEmailMessage]}
            margin="normal"
            fullWidth
          />
        </div>
        <FormLabel className={classes.radioGroupLabel} component="legend">
          Role: *
        </FormLabel>
        <RadioGroupBuilder
          handleChange={handleChange}
          groupValue={values.role}
          groupName={"role"}
          radios={[
            {
              value: "education_or_youth_worker",
              label: "Educator or Youth Worker",
            },
            {
              value: "parent_guardian_or_community_member",
              label: "Parent, guardian, or community member",
            },
          ]}
        />
        <div className={classes.softGateCheckbox}>
          <Checkbox
            name={"subscribe"}
            value={"subscribe"}
            label={
              <span>
                By submitting this form, I understand that I will receive communications from
                Alliance for a Healthier Generation. I can update my preferences or unsubscribe at
                any time. *
              </span>
            }
            checked={values.subscribe}
            handleChange={handleChangeCheckbox}
          />
          <Checkbox
            name={"terms"}
            value={"terms"}
            label={
              <span>
                I agree to the Alliance for a Healthier Generation{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.healthiergeneration.org/terms-of-use"
                >
                  Terms of Use
                </a>{" "}
                and{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.healthiergeneration.org/privacy-policy"
                >
                  Privacy Policy
                </a>
                , including the processing of my data to provide the information requested *
              </span>
            }
            checked={values.terms}
            handleChange={handleChangeCheckbox}
          />
        </div>
        <Button
          className={classes.submitButton}
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled()}
        >
          Continue to resource
        </Button>
      </ValidatorForm>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  emailTextfield: {
    marginBottom: theme.spacing(),
  },
  radioGroupLabel: {
    fontSize: styleVars.txtFontSizeXs,
    paddingTop: theme.spacing(),
    marginBottom: theme.spacing(0.25),
    color: styleVars.txtColorDefault,
  },
  softGateCheckbox: {
    marginTop: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  checkboxControlContainer: {
    display: "table-cell",
  },
  formControlLabel: {
    display: "table",
  },
}));
