import { each, isEmpty, toNumber } from 'lodash';
import currentUrlParamValue from './currentUrlParamValue';

/**
 * Update component state vars based on URL parameters.
 *
 * Does not return anything. You'll typically look for any changes
 * that have been made from within componentDidUpdate().
 *
 * @param {object} component
 *  The component object to operate on. When calling this
 *  method, you'll typically pass `this`.
 * @param {object} location
 *  Location object.
 * @param {array} definitions
 *  Array of objects, each with the props below. @TODO This structure is
 *  used in other related methods and should be defined somewhere as
 *  a standard convention in our app.
 *  ```
 *  {
 *    stateName: '',
 *    paramName: '', // omit component-specific prefixes
 *    defaultParamValue: '', // value to assume if not present as URL param
 *    valueType: '{num|str}'
 *  }
 *  ```
 * @param {string} qsPrefix
 */
export default function populateStateFromUrlParams(
  component,
  location,
  definitions,
  qsPrefix = ''
) {
  let newState = {};

  each(definitions, (value, key) => {
    let paramValue = currentUrlParamValue(
      value.paramName,
      qsPrefix,
      location,
      value.defaultParamValue
    );

    // Will be string by default. Check if it needs to be converted.
    if ('num' === value.valueType) {
      paramValue = toNumber(paramValue);
    }

    // Only add to newState if the value is different than
    // what state previously had.
    if (
      component.state.hasOwnProperty(value.stateName) &&
      component.state[value.stateName] !== paramValue
    ) {
      newState[value.stateName] = paramValue;
    }
  });

  // Only call setState if newState has values.
  if (!isEmpty(newState) && !component.isCancelled) {
    component.setState(newState);
  }
}
