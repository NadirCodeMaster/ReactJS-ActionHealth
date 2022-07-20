import React, { Fragment, useEffect, useRef, useState } from "react";
import { find, get } from "lodash";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import HgSelect from "components/ui/HgSelect";
import { nullBucket } from "../../utils/constants";

//
// PlanItem category selection block.
// ----------------------------------
//

export default function CategorySelectionBlock({
  buckets,
  handleSelectionChange,
  readOnly,
  savingChanges,
  selectedBucketId,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();

  const [selectValues, setSelectValues] = useState([]);
  const [printFriendlyLabelText, setPrintFriendlyLabelText] = useState("");

  useEffect(() => {
    let newSelectValues = buckets.map(function (b) {
      return { value: b.id, label: b.name };
    });
    setSelectValues(newSelectValues);
  }, [buckets]);

  useEffect(() => {
    let newPrintFriendlyLabelText = get(
      find(selectValues, { value: selectedBucketId }),
      "label",
      ""
    );
    setPrintFriendlyLabelText(newPrintFriendlyLabelText);
  }, [selectValues, selectedBucketId]);

  return (
    <div className={classes.wrapper}>
      <h3>Action Plan Category</h3>

      {buckets.length === 0 ? (
        <div className={classes.notAvailable}>
          <em>No Categories available.</em>
        </div>
      ) : (
        <Fragment>
          <div className={clsx(classes.selectWrapper, "no-print")}>
            <HgSelect
              isDisabled={readOnly || savingChanges}
              placeholder="Select a Category"
              aria-label="Select a Category"
              maxMenuHeight={220}
              name="plan_bucket_id"
              isMulti={false}
              options={selectValues}
              value={
                selectValues.filter(({ value }) => {
                  // Null bucket
                  if (value === nullBucket.id && !selectedBucketId) {
                    return true;
                  }
                  // Other buckets.
                  return value === selectedBucketId;
                }) || ""
              }
              onChange={handleSelectionChange}
            />
          </div>
          <div className="only-print">{printFriendlyLabelText}</div>
        </Fragment>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  notAvailable: {
    fontStyle: "italic",
  },
  selectWrapper: {},
  wrapper: {},
}));

CategorySelectionBlock.propTypes = {
  buckets: PropTypes.array.isRequired,
  handleSelectionChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  savingChanges: PropTypes.bool,
  // selectedBucketId: PropTypes.number // @TODO
};
