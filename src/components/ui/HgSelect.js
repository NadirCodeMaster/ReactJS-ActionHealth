import React, { Fragment, useEffect, useState } from "react";
import { get } from "lodash";
import Select from "react-select";
import reactSelectStyles from "style/reactSelectStyles";

/**
 * HgSelect wrapper for react-select to standarize specific props
 *
 * Note: because react-select v2 does not yet have an official "required"
 *       prop, we have to create the somewhat hacky hidden input below
 *       in order to get the desired standard form required effect.
 * Discussion on react-select "required" prop":
 *       https://github.com/JedWatson/react-select/issues/3140
 */
export default function HgSelect(props) {
  // onChange is a required prop on input, this no-operation function
  // allows us to create an onChange function with no slowdown.
  const noop = () => {};
  const [mergedStyles, setMergedStyles] = useState({});

  useEffect(() => {
    let callerStyles = get(props, "styles", {});
    let defaultStyles = {
      ...reactSelectStyles,
      zIndex: 9999, // @TODO review if still needed
    };

    let newMergedStyles = {
      ...defaultStyles,
      ...callerStyles,
    };

    setMergedStyles(newMergedStyles);
  }, [props]);

  return (
    <Fragment>
      <Select
        {...props}
        captureMenuScroll={false}
        getOptionLabel={({ label }) => label}
        getOptionValue={({ value }) => value}
        styles={mergedStyles}
      />
      {!props.disabled && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0 }}
          value={props.value}
          required={props.required || false}
          onChange={noop}
        />
      )}
    </Fragment>
  );
}
