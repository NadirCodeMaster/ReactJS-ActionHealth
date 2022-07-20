import PropTypes from 'prop-types';
import { responseWithResponseValueShape } from 'constants/propTypeShapes';

/**
 * Custom PropType shape definitions.
 *
 * Example usage:
 * ```
 * MyComponent.propTypes = {
 *   organization: PropTypes.shape(organizationShape).isRequired
 * };
 * ```
 */

/**
 * Plan object.
 */
export const planShape = {
  id: PropTypes.number.isRequired
  // @TODO
};

/**
 * Bucket object.
 */
export const bucketShape = {
  id: PropTypes.number.isRequired
  // @TODO
};

/**
 * Item object.
 */
export const itemShape = {
  criterion_id: PropTypes.number,
  description: PropTypes.string,
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  plan_bucket_id: PropTypes.number,
  plan_id: PropTypes.number.isRequired
};

/**
 * Item with response and response_value.
 */
export const itemWithResponseShape = {
  ...itemShape,
  response: PropTypes.shape(responseWithResponseValueShape).isRequired
};
