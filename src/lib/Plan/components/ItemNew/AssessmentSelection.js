import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import HgSelect from "components/ui/HgSelect";
import { organizationWithAvailableSetsShape } from "constants/propTypeShapes";

//
// Assessment selection field for Action Plan new item view.
//

export default function AssessmentSelection({
  classes,
  handleAssessmentSelectChange,
  organization,
  selectedSetId,
  userCanEditActionPlan,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [selectValues, setSelectValues] = useState([]);

  useEffect(() => {
    let availSets = !isEmpty(organization.available_sets) ? organization.available_sets : [];
    let newSelectValues = availSets.map(function (set) {
      return { value: set.id, label: set.name };
    });
    if (mounted.current) {
      setSelectValues(newSelectValues);
    }
  }, [organization]);

  return (
    <Fragment>
      {isEmpty(selectValues) ? (
        <div>
          <em>No assessments are available for {organization.name}.</em>
        </div>
      ) : (
        <div className={classes.selectWrapper}>
          <HgSelect
            isDisabled={!userCanEditActionPlan}
            placeholder="Select an Assessment"
            aria-label="Select an Assessment"
            maxMenuHeight={220}
            name="setId"
            isMulti={false}
            options={selectValues}
            value={selectValues.filter(({ value }) => value === selectedSetId) || ""}
            onChange={handleAssessmentSelectChange}
          />
        </div>
      )}
    </Fragment>
  );
}

AssessmentSelection.propTypes = {
  classes: PropTypes.object.isRequired,
  handleAssessmentSelectChange: PropTypes.func.isRequired,
  organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
  selectedSetId: PropTypes.number,
  userCanEditActionPlan: PropTypes.bool.isRequired,
};
