import PropTypes from "prop-types";

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
 * Standard organization as returned from the API.
 */
export const organizationShape = {
  id: PropTypes.number.isRequired,
  requester_permissions: PropTypes.array, // may be array or null
  requester_pivot: PropTypes.object, // @TODO check if always provided by API
};

/**
 * Organization that includes available_sets.
 * Organizations are only returned like this from certain endpoints.
 */
export const organizationWithAvailableSetsShape = {
  ...organizationShape,
  available_sets: PropTypes.array.isRequired,
};

/**
 * Standard organization type as returned from the API.
 */
export const organizationTypeShape = {
  id: PropTypes.number.isRequired,
  machine_name: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  name_plural: PropTypes.string.isRequired,
  graded: PropTypes.bool,
  requires_access_approval: PropTypes.bool,
};

/**
 * Standard program as returned from the API.
 */
export const programShape = {
  id: PropTypes.number.isRequired,
  machine_name: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

/**
 * Matches the data property of our "currentUser" var.
 * This is the object that contains actual user info values.
 */
export const currentUserDataShape = {
  id: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  system_role_id: PropTypes.number.isRequired,
  name_first: PropTypes.string.isRequired,
  name_last: PropTypes.string.isRequired,
};

/**
 * Matches our "currentUser" var.
 * This is as it exists in Redux, which nests the typical user data
 * inside a data property (*if* user is authenticated).
 */
export const currentUserShape = {
  isAuthenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  // @TODO Add data as object or missing. Or maybe add a shape for authenticated user.
};

/**
 * Basic response record (not necessarily hydrated w/response_value property).
 */
export const responseShape = {
  criterion_id: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  organization_id: PropTypes.number.isRequired,
  response_value_id: PropTypes.number.isRequired,
};

/**
 * Response value record.
 */
export const responseValueShape = {
  id: PropTypes.number.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  response_structure_id: PropTypes.number.isRequired,
};

/**
 * Response record with hydrated response_value property.
 */
export const responseWithResponseValueShape = {
  ...responseShape,
  response_value: PropTypes.shape(PropTypes.shape).isRequired,
};
