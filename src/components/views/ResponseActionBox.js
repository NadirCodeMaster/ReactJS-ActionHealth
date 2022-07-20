import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { isNil, isEmpty, find, filter } from "lodash";
import startHereImg from "images/start_here.svg";

/**
 * Response Action Box
 */
export default function ResponseActionBox({ premiumSetMachineName, organization }) {
  const classes = useStyles();
  const premiumSet = _premiumSet(organization, premiumSetMachineName);
  const orgHasPremiumSet = isNil(premiumSet) ? false : true;
  const orgHasPremiumSetResponse = orgHasPremiumSet
    ? _orgHasPremiumSetResponse(organization, premiumSetMachineName)
    : false;

  const responseContent = () => {
    if (orgHasPremiumSet && !orgHasPremiumSetResponse) {
      // @TODO Look into modifying CtaTemplateA to allow use of Button
      // Could reduce some of this boilerplate code
      return (
        <Fragment>
          <h3>Start here!</h3>
          <div className={classes.responseBody}>
            Answer core questions to help you identify priorities and build a solid foundation to
            make healthy changes.
          </div>
          <Button
            className={classes.responseButton}
            color="primary"
            variant="contained"
            href={`/app/programs/${premiumSet.program_id}/organizations/${organization.id}/sets/${premiumSet.id}`}
          >
            Get Started
          </Button>
        </Fragment>
      );
    }

    if (orgHasPremiumSet && orgHasPremiumSetResponse) {
      return (
        <Fragment>
          <h3>Keep going!</h3>
          <div className={classes.responseBody}>
            Return to your assessment to track progress as healthy changes are implemented.
          </div>
          <Button
            className={classes.responseButton}
            color="primary"
            variant="contained"
            href={`/app/programs/${premiumSet.program_id}/organizations/${organization.id}/sets/${premiumSet.id}`}
          >
            Continue assessment
          </Button>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <h3>Assess your practices and policies</h3>
        <div>Choose an assessment below to learn where you can make healthy changes.</div>
      </Fragment>
    );
  };

  return (
    <div className={classes.responseContainer}>
      <div>
        <img alt="" className={classes.responseImage} src={startHereImg} />
      </div>
      <div className={classes.responseContent}>{responseContent()}</div>
    </div>
  );
}

// Check to see if org has a premiumSet, return first one available
const _premiumSet = (organization, premiumSetMachineName) => {
  return find(organization.available_sets, (_set) => {
    return _set.program.machine_name === premiumSetMachineName;
  });
};

// Get all premium sets, and check if one has a lastResponse value
const _orgHasPremiumSetResponse = (organization, premiumSetMachineName) => {
  let premiumSets = filter(organization.available_sets, (_set) => {
    return _set.program.machine_name === premiumSetMachineName && !isNil(_set.lastResponse);
  });

  return !isEmpty(premiumSets);
};

const useStyles = makeStyles((theme) => ({
  responseContainer: {
    display: "flex",
  },
  responseImage: {
    height: "40px",
    marginRight: theme.spacing(2),
  },
  responseContent: {},
  responseBody: {
    marginBottom: theme.spacing(3),
  },
  responseButton: {
    borderRadius: 5,
  },
}));

ResponseActionBox.propTypes = {
  organization: PropTypes.object,
  premiumSetMachineName: PropTypes.string,
};
