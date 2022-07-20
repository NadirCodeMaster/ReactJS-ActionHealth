import makeRequest from "api/makeRequest";
import { forEach } from "lodash";
import isNumeric from "utils/isNumeric";
import currentWebsocketId from "utils/currentWebsocketId";

/**
 * API requests
 *
 * Using a local instance of programs-api, endpoints are documented at
 * `{api_host}/docs`. Those docs describe the required and optional parameters
 * of each endpoint, as well as the various status codes that you'll need to
 * evaluate when parsing a response.
 *
 * Note: Our custom libraries contain additional library-specific request
 * definitions in their directories at `src/libs/{lib}/requests.js`.
 *
 * Example method usage:
 *
 * ```
 * import { requestPrograms } from `api/requests.js'
 *
 * requestPrograms().then(res => {
 *   console.log(res);
 * });
 * ```
 */

// Create a Criterion record.
export const requestCreateCriterion = (criterion) => {
  return makeRequest({
    url: `/api/v1/criteria`,
    body: criterion,
    method: "POST",
  });
};

// Create a CriterionInstance record.
export const requestCreateCriterionInstance = (criterionInstance) => {
  return makeRequest({
    url: `/api/v1/criterion-instances`,
    body: criterionInstance,
    method: "POST",
  });
};

// Create a new resource document
export const requestCreateResourceFile = (recFile) => {
  return makeRequest({
    url: `/api/v1/resources/files`,
    body: recFile,
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    contentType: "multipart/form-data",
  });
};

// Create a Term record.
export const requestCreateTerm = (term) => {
  return makeRequest({
    url: `/api/v1/terms`,
    body: term,
    method: "POST",
  });
};

// Create a team member invitation.
export const requestCreateInvitation = (payload) => {
  return makeRequest({
    url: `/api/v1/users/invite-team-member`,
    body: payload,
    method: "POST",
  });
};

// Resend a team member invitation.
export const requestResendInvitation = (payload) => {
  return makeRequest({
    url: `/api/v1/users/resend-team-member-invite`,
    body: payload,
    method: "POST",
  });
};

/**
 * Create an Action Plan Item.
 *
 * Requires that payload.organization_id be provided. If
 * payload.plan_id is provided, the item will go there
 * (assuming it's a valid destination). Otherwise, the default
 * plan for organization will be used.
 *
 * @param payload
 */
export const requestCreatePlanItem = (payload) => {
  if (!payload.organization_id) {
    console.error("Invalid payload in requestCreatePlanItem");
    return;
  }
  return makeRequest({
    url: `/api/v1/plan-items`,
    body: payload,
    method: "POST",
  });
};

/**
 * Create multiple Organization Action Plan Items.
 *
 * @param payload
 */
export const requestCreatePlanItems = (payload) => {
  // Add socketId to payload if websocket is available.
  payload.socket_id = currentWebsocketId() || null;
  return makeRequest({
    url: `/api/v1/plan-items-bulk`,
    body: payload,
    method: "POST",
  });
};

// Add a new Criterion Task
export const requestCreateCriterionTask = (payload) => {
  // Note: `payload` should contain criterion_id and organization_id
  // (unless it's some kind of admin operation).
  payload.socket_id = currentWebsocketId() || null;
  return makeRequest({
    url: `/api/v1/criterion-tasks`,
    body: payload,
    method: "POST",
  });
};

// Add a new Criterion Note
export const requestCreateCriterionNote = (payload) => {
  // Note: `payload` should contain criterion_id and organization_id
  // (unless it's some kind of admin operation).
  payload.socket_id = currentWebsocketId() || null;
  return makeRequest({
    url: `/api/v1/criterion-notes`,
    body: payload,
    method: "POST",
  });
};

// Create an Organization Response to a question (CriterionInstance)
export const requestCreateResponse = (payload) => {
  return makeRequest({
    url: `/api/v1/responses`,
    body: payload,
    method: "POST",
  });
};

// Create a new Module record in a Set.
export const requestCreateModule = (mod) => {
  return makeRequest({
    url: `/api/v1/modules`,
    body: mod,
    method: "POST",
  });
};

// Create a new Set (assessment) record in a Program.
export const requestCreateSet = (set) => {
  return makeRequest({
    url: `/api/v1/sets`,
    body: set,
    method: "POST",
  });
};

// Create a new activity log record for a User.
export const requestCreateUserActivity = (activity) => {
  return makeRequest({
    url: `/api/v1/activity/log`,
    body: { activity: activity },
    method: "POST",
  });
};

// Create a new activity log record for a Resource.
export const requestCreateResourceActivity = (params) => {
  return makeRequest({
    url: `/api/v1/resources/log`,
    body: params,
    method: "POST",
  });
};

// Log that a soft gated resource was accessed
// Example params:
// params = {
//   resource_id: 1,
//   email: 'fake@gmail.com',
//   role: 'education_or_youth_worker'
// }
export const requestLogSoftGatedResource = (params) => {
  return makeRequest({
    url: `/api/v1/resources/soft-log`,
    body: params,
    method: "PUT",
  });
};

// Create a User record.
export const requestCreateUser = (user) => {
  return makeRequest({
    url: `/api/v1/users`,
    body: user,
    method: "POST",
  });
};

// Create a Resource record.
export const requestCreateResource = (resource) => {
  return makeRequest({
    url: `/api/v1/resources`,
    body: resource,
    method: "POST",
  });
};

// Create a Tag record.
export const requestCreateTag = (tag) => {
  return makeRequest({
    url: `/api/v1/tags`,
    body: tag,
    method: "POST",
  });
};

// ----------------------
// Updates (success: 200 or 201 [@TODO Standardize])
// ----------------------

// Update an Organization Action Plan Item.
export const requestUpdatePlanItem = (planItemObj) => {
  let payload = planItemObj;
  payload.socket_id = currentWebsocketId() || null;
  return makeRequest({
    url: `/api/v1/plan-items/${planItemObj.id}`,
    body: payload,
    method: "PUT",
  });
};

// Update a Criterion Task record
export const requestUpdateCriterionTask = (criterionTask) => {
  let payload = criterionTask;
  payload.socket_id = currentWebsocketId() || null;
  return makeRequest({
    url: `/api/v1/criterion-tasks/${criterionTask.id}`,
    body: payload,
    method: "PUT",
  });
};

// Update a Criterion Note record
export const requestUpdateCriterionNote = (criterionNote) => {
  let payload = criterionNote;
  payload.socket_id = currentWebsocketId() || null;

  return makeRequest({
    url: `/api/v1/criterion-notes/${criterionNote.id}`,
    body: payload,
    method: "PUT",
  });
};

// Toggle the completion of a criterion Task
export const requestCompleteCriterionTask = (criterionTask, newCompletionStatus) => {
  let payload = {
    completed: Boolean(newCompletionStatus),
  };
  payload.socket_id = currentWebsocketId() || null;
  return makeRequest({
    url: `/api/v1/criterion-tasks/${criterionTask.id}/update-completed`,
    body: payload,
    method: "PUT",
  });
};

// Update a Criterion Tasks array
// Note: Each task is evaluated individually by the API and updated
// according to their own data. In other words, there's nothing limiting
// them to a single org.
export const requestUpdateCriterionTasks = (criterionId, criterionTasks) => {
  let socketId = currentWebsocketId() || "";
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/tasks-bulk`,
    body: {
      criterion_tasks: criterionTasks,
      socket_id: socketId,
    },
    method: "PUT",
  });
};

/**
 * Update items in a bucket. Must include _all_ items that are to remain in
 * bucket (not just the new ones). Sorting is applied to the provided items
 * based on the order of the provided `items` array. We translate that into
 * a corresponding weight property on each item.
 */
export const requestUpdatePlanBucketItems = (organizationId, bucketId, items = []) => {
  // Convert provided items array to the meta format required by API
  // and adjust/force certain values.
  let sending = [];
  forEach(items, (item, itemIdx) => {
    sending.push({
      plan_item_id: item.id,
      weight: itemIdx + 1,
    });
  });

  if (!bucketId || !isNumeric(bucketId)) {
    bucketId = 0;
  }
  bucketId = Number(bucketId);

  let socketId = currentWebsocketId() || "";

  return makeRequest({
    url: `/api/v1/organizations/${organizationId}/plans/current/buckets/${bucketId}/items`,
    body: {
      plan_bucket_items: sending,
      socket_id: socketId,
    },
    method: "PUT",
  });
};

// Update a Resource record
export const requestUpdateResource = (resourceId, resource) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}`,
    body: resource,
    method: "PUT",
  });
};

// Update a Tag record
export const requestUpdateTag = (tagId, tag) => {
  return makeRequest({
    url: `/api/v1/tags/${tagId}`,
    body: tag,
    method: "PUT",
  });
};

// Update a User record.
export const requestUpdateUser = (data) => {
  return makeRequest({
    url: `/api/v1/users/${data.id}`,
    body: data,
    method: "PUT",
  });
};

/**
 * Set the Resources associated with a Criterion.
 *
 * Payload replaces existing associations. Existing Resource associations
 * that are not included in payload shall be unassociated.
 *
 * @see https://github.com/alliance/cms/issues/1963
 *
 * @param {Number} criterionId
 * @param {Array} pivots
 *  Array of criterion/resource pivot record objects. The only valid properties
 *  for those objects are `resource_id` and `weight`.
 */
export const requestUpdateCriterionResources = (criterionId, pivots) =>
  makeRequest({
    url: `/api/v1/criteria/${criterionId}/resources`,
    body: pivots,
    method: "PUT",
  });

/**
 * Set the UserFunctions associated with a Criterion.
 *
 * Payload replaces existing associations. Existing UserFunction associations
 * that are not included in payload shall be unassociated.
 *
 * @param {Number} criterionId
 * @param {Array} pivots
 *  Array of criterion/user pivot record objects. The only valid properties
 *  for those objects are `user_function_id` and `weight`.
 */
export const requestUpdateCriterionUserFunctions = (criterionId, pivots) =>
  makeRequest({
    url: `/api/v1/criteria/${criterionId}/user-functions`,
    body: pivots,
    method: "PUT",
  });

/**
 * Set the UserFunctions associated with a Resource.
 *
 * @param {Number} resourceId
 * @param {Array} pivots
 *  Array of resource/user pivot record objects. The only valid properties
 *  for those objects are `user_function_id` and `weight`.
 */
export const requestUpdateResourceUserFunctions = (resourceId, pivots) =>
  makeRequest({
    url: `/api/v1/resources/${resourceId}/user-functions`,
    body: pivots,
    method: "PUT",
  });

// Update pivot data in a User/Organization relationship.
export const requestUpdateUserOrganization = (userId, organizationId, payload) =>
  makeRequest({
    url: `/api/v1/users/${userId}/organizations/${organizationId}`,
    body: payload,
    method: "PUT",
  });

// Approve a User request to join an Organization.
export const requestApproveUserOrganizationRequest = (userId, organizationId) =>
  makeRequest({
    url: `/api/v1/users/${userId}/organizations/${organizationId}/approve`,
    body: null,
    method: "PUT",
  });

// Deny a User request to join an Organization.
export const requestDenyUserOrganizationRequest = (userId, organizationId) =>
  makeRequest({
    url: `/api/v1/users/${userId}/organizations/${organizationId}/deny`,
    body: null,
    method: "PUT",
  });

// Update a Criterion record.
export const requestUpdateCriterion = (criterionId, criterion) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}`,
    body: criterion,
    method: "PUT",
  });
};

// Update a Content record.
export const requestUpdateContent = (contentMachineName, content) => {
  return makeRequest({
    url: `/api/v1/contents/${contentMachineName}`,
    body: content,
    method: "PUT",
  });
};

// Update a Term record.
export const requestUpdateTerm = (termId, term) => {
  return makeRequest({
    url: `/api/v1/terms/${termId}`,
    body: term,
    method: "PUT",
  });
};

// Update a CriterionInstance record.
export const requestUpdateCriterionInstance = (criterionInstanceId, criterionInstance) => {
  return makeRequest({
    url: `/api/v1/criterion-instances/${criterionInstanceId}`,
    body: criterionInstance,
    method: "PUT",
  });
};

// Update a Module record.
export const requestUpdateModule = (moduleId, mod) => {
  return makeRequest({
    url: `/api/v1/modules/${moduleId}`,
    body: mod,
    method: "PUT",
  });
};

// Update a Set record.
export const requestUpdateSet = (setId, set) => {
  return makeRequest({
    url: `/api/v1/sets/${setId}`,
    body: set,
    method: "PUT",
  });
};

// M2M relationship linking (success: 201)
// ------------------------
export const requestLinkUserOrganization = (userId, payload) =>
  makeRequest({
    url: `/api/v1/users/${userId}/organizations`,
    body: payload,
    method: "POST",
  });

// Associate a Criterion with a GradeLevel.
export const requestLinkCriterionGradeLevel = (criterionId, gradeLevelId) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/grade-levels`,
    body: { grade_level_id: gradeLevelId },
    method: "POST",
  });
};

/**
 * Associate a Resource with a Criterion.
 *
 * @see https://github.com/alliance/cms/issues/1963
 *
 * @param {Number} criterionId
 * @param {Object} pivot
 *  Criterion/resource pivot record object. The only valid properties
 *  for those objects are `resource_id` and `weight`.
 */
export const requestLinkCriterionResource = (criterionId, pivot) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/resources`,
    body: pivot,
    method: "POST",
  });
};

/**
 * Associate a Criterion with a Resource.
 *
 * @see https://github.com/alliance/cms/issues/1963
 *
 * @param {Number} criterionId
 * @param {Object} pivot
 *  Criterion/resource pivot record object. The only valid properties
 *  for those objects are `resource_id` and `weight`.
 */
export const requestLinkResourceCriterion = (resourceId, pivot) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/criteria`,
    body: pivot,
    method: "POST",
  });
};

/**
 * Associate a Criterion with a UserFunction.
 *
 * @param {Number} criterionId
 * @param {Object} pivot
 *  Criterion/userfunction pivot record object. The only valid properties
 *  for those objects are `resource_id` and `weight`.
 */
export const requestLinkCriterionUserFunction = (criterionId, pivot) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/user-functions`,
    body: pivot,
    method: "POST",
  });
};

/**
 * Associate a User Function with a Resource.
 *
 * @param {Number} resourceId
 * @param {Object} pivot
 *  Resource/userfunction pivot record object. The only valid properties
 *  for those objects are `resource_id` and `weight`.
 */
export const requestLinkResourceUserFunction = (resourceId, pivot) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/user-functions`,
    body: pivot,
    method: "POST",
  });
};

/**
 * Associate a Resource with a Tag
 *
 * @param {Number} criterionId
 * @param {Object} payload
 *  Resource/Tag payload record object. The only valid properties
 *  for those objects is `tag_id`
 */
export const requestLinkResourceTag = (resourceId, payload) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/tags`,
    body: payload,
    method: "POST",
  });
};

/**
 * Associate a Related Resource with a Resource
 *
 * @param {Number} resourceId
 * @param {Object} payload
 */
export const requestLinkRelatedResource = (resourceId, payload) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/related`,
    body: payload,
    method: "POST",
  });
};

/**
 * Associate a CDC Handle  with a Criterion.
 *
 * @param {Number} criterionId
 * @param {Object} pivot
 *  Criterion/cdcHandle pivot record object. The only valid properties
 *  for those objects are `criterion_id` and `handle`.
 */
export const requestLinkCriterionCdcHandle = (pivot) => {
  return makeRequest({
    url: `/api/v1/cdc-criterion-handles`,
    body: pivot,
    method: "POST",
  });
};

// Associate a User with an Organization.
export const requestLinkOrganizationUser = (
  userId,
  organizationId,
  organizationRoleId,
  userFunctionId = null
) => {
  return makeRequest({
    url: `/api/v1/users/${userId}/organizations`,
    body: {
      user_id: userId,
      organization_id: organizationId,
      organization_role_id: organizationRoleId,
      user_function_id: userFunctionId,
    },
    method: "POST",
  });
};

// ----------------------------------------------------
// M2M relationship UNlinking (success is usually: 204)
// ----------------------------------------------------

export const requestUnlinkUserOrganization = (userId, organizationId) =>
  makeRequest({
    url: `/api/v1/users/${userId}/organizations/${organizationId}`,
    method: "DELETE",
  });

// Disassociate a Criterion from a GradeLevel.
export const requestUnlinkCriterionGradeLevel = (criterionId, gradeLevelId) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/grade-levels/${gradeLevelId}`,
    method: "DELETE",
  });
};

// Disassociate a Criterion from a UserFunction.
export const requestUnlinkCriterionUserFunction = (criterionId, userFunctionId) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/user-functions/${userFunctionId}`,
    method: "DELETE",
  });
};

// Disassociate a Resource from a UserFunction.
export const requestUnlinkResourceUserFunction = (resourceId, userFunctionId) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/user-functions/${userFunctionId}`,
    method: "DELETE",
  });
};

// Delete a Criterion Task record
export const requestDeleteCriterionTask = (criterionTaskId) => {
  // Include socket id if websocket is available.
  let socketId = currentWebsocketId();
  let queries = "";
  if (socketId) {
    queries = `socket_id=${socketId}`;
  }
  return makeRequest({
    url: `/api/v1/criterion-tasks/${criterionTaskId}?${queries}`,
    body: null,
    method: "DELETE",
  });
};

// Delete a Criterion Note record
export const requestDeleteCriterionNote = (criterionNoteId) => {
  // Include socket id if websocket is available.
  let socketId = currentWebsocketId();
  let queries = "";
  if (socketId) {
    queries = `socket_id=${socketId}`;
  }

  return makeRequest({
    url: `/api/v1/criterion-notes/${criterionNoteId}?${queries}`,
    body: null,
    method: "DELETE",
  });
};

// Disassociate a Resource from a Criterion.
export const requestUnlinkCriterionResource = (criterionId, resourceId) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}/resources/${resourceId}`,
    method: "DELETE",
  });
};

// Disassociate a Criterion from a Resource.
export const requestUnlinkResourceCriterion = (resourceId, criterionId) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/criteria/${criterionId}`,
    method: "DELETE",
  });
};

// Disassociate a Tag from a Resource.
export const requestUnlinkTagResource = (resourceId, tagId) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/tags/${tagId}`,
    method: "DELETE",
  });
};

// Disassociate a Related Resource from a Resource.
export const requestUnlinkRelatedResource = (resourceId, relatedId) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}/related/${relatedId}`,
    method: "DELETE",
  });
};

// -------
// Deletes
// -------

// Delete an Action Plan Item record.
export const requestDeletePlanItem = (planItemId) => {
  // Include socket id if websocket is available.
  let socketId = currentWebsocketId();
  let queries = "";
  if (socketId) {
    queries = `socket_id=${socketId}`;
  }

  return makeRequest({
    url: `/api/v1/plan-items/${planItemId}?${queries}`,
    method: "DELETE",
  });
};

// Delete a User record.
export const requestDeleteUser = (userId) =>
  makeRequest({
    url: `/api/v1/users/${userId}`,
    method: "DELETE",
  });

// Delete a Criterion record.
export const requestDeleteCriterion = (criterionId) => {
  return makeRequest({
    url: `/api/v1/criteria/${criterionId}`,
    method: "DELETE",
  });
};

// Delete a CriterionInstance record.
export const requestDeleteCriterionInstance = (criterionInstanceId) => {
  return makeRequest({
    url: `/api/v1/criterion-instances/${criterionInstanceId}`,
    method: "DELETE",
  });
};

// Delete a Term record.
export const requestDeleteTerm = (termId) => {
  return makeRequest({
    url: `/api/v1/terms/${termId}`,
    method: "DELETE",
  });
};

// Delete a Module record.
export const requestDeleteModule = (moduleId) => {
  return makeRequest({
    url: `/api/v1/modules/${moduleId}`,
    method: "DELETE",
  });
};

// Delete a Resource record.
export const requestDeleteResource = (resourceId) => {
  return makeRequest({
    url: `/api/v1/resources/${resourceId}`,
    method: "DELETE",
  });
};

// Delete a Tag record.
export const requestDeleteTag = (tagId) => {
  return makeRequest({
    url: `/api/v1/tags/${tagId}`,
    method: "DELETE",
  });
};

// Delete a Set record.
export const requestDeleteSet = (setId) => {
  return makeRequest({
    url: `/api/v1/sets/${setId}`,
    method: "DELETE",
  });
};

// Delete a CDC Criterion Handle
export const requestDeleteCdcHandle = (cdcHandle) => {
  return makeRequest({
    url: `/api/v1/cdc-criterion-handles/${cdcHandle}`,
    method: "DELETE",
  });
};

// --------------
// GET Retrievals
// --------------

// Get AppMeta structure (includes multiple models).
export const requestAppMeta = () =>
  makeRequest({
    url: `/api/v1/app/meta`,
    method: "GET",
  });

// Get multiple Criteria records.
export const requestCriteria = (params) =>
  makeRequest({
    url: "/api/v1/criteria",
    body: params,
    method: "GET",
  });

// Get multiple content
export const requestContents = (params) =>
  makeRequest({
    url: "/api/v1/contents",
    body: params,
    method: "GET",
  });

// Get content based on machine name
export const requestContentsShow = (params) =>
  makeRequest({
    url: "/api/v1/contents-show",
    body: params,
    method: "GET",
  });

// Get content based on machine name
export const requestFiles = (params) =>
  makeRequest({
    url: "/api/v1/files",
    body: params,
    method: "GET",
  });

// Get multiple Terms
export const requestTerms = (params) =>
  makeRequest({
    url: "/api/v1/terms",
    body: params,
    method: "GET",
  });

// Get single Term
export const requestTerm = (termId) =>
  makeRequest({
    url: `/api/v1/terms/${termId}`,
    method: "GET",
  });

// Get a single Criterion record.
export const requestCriterion = (criterionId) =>
  makeRequest({
    url: `/api/v1/criteria/${criterionId}`,
    method: "GET",
  });

// Get a single CriterionInstance record.
export const requestCriterionInstance = (criterionInstanceId) =>
  makeRequest({
    url: `/api/v1/criterion-instances/${criterionInstanceId}`,
    method: "GET",
  });

// Get multiple CriterionInstance records.
export const requestCriterionInstances = (params) =>
  makeRequest({
    url: `/api/v1/criterion-instances`,
    body: params,
    method: "GET",
  });

// Get multiple Resources records associated with a Criterion.
export const requestCriterionResources = (criterionId, params) =>
  makeRequest({
    url: `/api/v1/criteria/${criterionId}/resources`,
    body: params,
    method: "GET",
  });

// Get multiple Resources records associated with a Module.
export const requestModuleResources = (moduleId, params) =>
  makeRequest({
    url: `/api/v1/modules/${moduleId}/resources`,
    body: params,
    method: "GET",
  });

// Get multiple UserFunction records associated with a Criterion.
export const requestCriterionUserFunctions = (criterionId, params) =>
  makeRequest({
    url: `/api/v1/criteria/${criterionId}/user-functions`,
    body: params,
    method: "GET",
  });

// Get multiple UserFunction records associated with a Resource.
export const requestResourceUserFunctions = (resourceId, params) =>
  makeRequest({
    url: `/api/v1/resources/${resourceId}/user-functions`,
    body: params,
    method: "GET",
  });

// Get cdcHandles associated with a Criterion.
export const requestCriterionCdCHandles = (criterionId, params) =>
  makeRequest({
    url: `/api/v1/criteria/${criterionId}/cdc-criterion-handles`,
    body: params,
    method: "GET",
  });

// Get Tags associated with a Resource.
export const requestResourceTags = (resourceId, params) =>
  makeRequest({
    url: `/api/v1/resources/${resourceId}/tags`,
    body: params,
    method: "GET",
  });

// Get all GradeLevel records.
// Note: Available in redux under app_meta.
export const requestGradeLevels = () =>
  makeRequest({
    url: `/api/v1/grade-levels`,
    method: "GET",
  });

// Get an Invitation record based on token, email
export const requestInvitation = (inviteToken, email) => {
  return makeRequest({
    url: `/api/v1/users/invite-team-member`,
    body: { email: email, token: inviteToken },
    method: "GET",
  });
};

// Get multiple Module records
export const requestModules = (params) =>
  makeRequest({
    url: `/api/v1/modules`,
    body: params,
    method: "GET",
  });

// Get multiple CriterionInstances that belong to a Module.
export const requestModuleCriterionInstances = (moduleId, params) =>
  makeRequest({
    url: `/api/v1/modules/${moduleId}/criterion-instances`,
    body: params,
    method: "GET",
  });

// Get a single Organization record.
export const requestOrganization = (organizationId) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}`,
    method: "GET",
  });

// Get current Action Plan for an Organization.
export const requestOrganizationPlan = (organizationId) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/plans/current`,
    method: "GET",
    redirectOnAuthFailure: false, // not unexpected for a user to not have access
  });

// Get a specific plan item.
export const requestPlanItem = (planItem) =>
  makeRequest({
    url: `/api/v1/plan-items/${planItem}`,
    body: null,
    method: "GET",
  });

// Get Criterion Tasks for an organization
export const requestOrganizationCriterionTasks = (organizationId, payload = {}) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/criterion-tasks`,
    body: payload,
    method: "GET",
  });

// Get Criterion Notes for an organization.
export const requestOrganizationCriterionNotes = (organizationId, payload = {}) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/criterion-notes`,
    body: payload,
    method: "GET",
  });

// Get Buckets for the current Action Plan for an Organization.
export const requestOrganizationPlanBuckets = (organizationId) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/plans/current/buckets`,
    method: "GET",
  });

// Get Items for the current Action Plan for an Organization.
export const requestOrganizationPlanItems = (organizationId, params = {}) =>
  // Note: results can be filtered by bucket. Use plan_bucket_id:'-1'" to
  // filter by the no bucket.
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/plans/current/plan-items`,
    body: params,
    method: "GET",
    redirectOnAuthFailure: false, // not unexpected for a user to not have access
  });

// Get Programs an Organization is eligible for.
// Previously served Programs an Organization was "enrolled" in, but there is
// no longer a direct M2M relationship between orgs and progs.
export const requestOrganizationPrograms = (organizationId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/programs`,
    body: params,
    method: "GET",
  });

// Get Responses for an Organization.
// Note: Only the one most recent Response is returned per Criterion. We
// don't update or delete Response records; each time a question is answered
// we create a new Response record.
export const requestOrganizationResponses = (organizationId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/responses`,
    body: params,
    method: "GET",
  });

// Get all OrganizationRole records.
// Note: Available in redux under app_meta.
export const requestOrganizationRoles = () =>
  makeRequest({
    url: "/api/v1/organization-roles",
    method: "GET",
  });

// Get multiple Organization records.
export const requestOrganizations = (params) =>
  makeRequest({
    url: `/api/v1/organizations`,
    body: params,
    method: "GET",
  });

// Get multiple Sets for an Organization, along with other
// supporting data, including Responses.
export const requestOrganizationSets = (organizationId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/sets`,
    body: params,
    method: "GET",
  });

// Get a "report" for an Organization within the context of a Set.
// Binary formats are available; see API docs. The default JSON
// representation honors the pagination conventions as other multi-item
// endpoints, but binaries are not paginated.
export const requestOrganizationSetReport = (organizationId, setId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/sets/${setId}/report`,
    body: params,
    method: "GET",
  });

// Get a report summary for an Organization
export const requestOrganizationReportSummary = (organizationId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/reports/summary`,
    body: params,
    method: "GET",
  });

// Get all OrganizationType records.
// Note: Available in redux under app_meta.
export const requestOrganizationTypes = () =>
  makeRequest({
    url: "/api/v1/organization-types",
    method: "GET",
  });

// Get Organizations of a given OrganizationType.
export const requestOrganizationTypeOrganizations = (organizationTypeId, params) =>
  makeRequest({
    url: `/api/v1/organization-types/${organizationTypeId}/organizations`,
    body: params,
    method: "GET",
  });

// Get Users associated with an Organization.
export const requestOrganizationUsers = (organizationId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/users`,
    body: params,
    method: "GET",
    redirectOnAuthFailure: false, // not unexpected for a user to not have access
  });

// Get Users that are pending approval for a specific Organization.
export const requestOrganizationUsersPending = (organizationId, params) =>
  makeRequest({
    url: `/api/v1/organizations/${organizationId}/pending-users`,
    body: params,
    method: "GET",
    redirectOnAuthFailure: false, // not unexpected for a user to not have access
  });

// Resource soft gate logs
export const requestResourceSoftGateLogs = (params) =>
  makeRequest({
    url: `/api/v1/resource-soft-gate-logs`,
    body: params,
    method: "GET",
  });

// Get Users that are pending approval for any Organization.
export const requestUsersPending = (params) =>
  makeRequest({
    url: `/api/v1/users/organization-pending`,
    body: params,
    method: "GET",
  });

// Get Users that have pending invites for all organizations.
export const requestUsersInvitesPending = (params) =>
  makeRequest({
    url: `/api/v1/users/invite-pending`,
    body: params,
    method: "GET",
  });

// Get buckets for an action plan.
// @see requestOrganizationPlanBuckets()
export const requestPlanBuckets = (planId) =>
  makeRequest({
    url: `/api/v1/plans/${planId}/buckets`,
    method: "GET",
  });

// Get multiple Program records.
export const requestPrograms = (params) =>
  makeRequest({
    url: "/api/v1/programs",
    body: params,
    method: "GET",
  });

// Get single Program record that current user has access to.
export const requestProgram = (programId) =>
  makeRequest({
    url: `/api/v1/programs/${programId}`,
    method: "GET",
  });

// This returns curated Set status data for a single Organization
// in the context of a given Program. It's not a standard P2 model
// or collection of models.
// @see utils/parseProgramOrganizationData.js
export const requestProgramOrganizationInfo = (programId, organizationId) =>
  makeRequest({
    url: `/api/v1/programs/${programId}/organizations/${organizationId}`,
    method: "GET",
  });

// Get Organizations eligible for a Program.
// This previously provided Organizations that were associated with a Program,
// but that relationship is no longer in use. It now provides Organizations that
// are eligible for the Program based on the OrganizationType.
export const requestProgramOrganizations = (programId, params) =>
  makeRequest({
    url: `/api/v1/programs/${programId}/organizations`,
    body: params,
    method: "GET",
  });

// Get the OrganizationTypes specified by a Program.
export const requestProgramOrganizationTypes = (programId, params) =>
  makeRequest({
    url: `/api/v1/programs/${programId}/organization-types`,
    body: params,
    method: "GET",
  });

// Get Sets in a Program that are visible to the current user.
export const requestProgramSets = (programId, params) =>
  makeRequest({
    url: `/api/v1/programs/${programId}/sets`,
    body: params,
    method: "GET",
  });

// Get a single Tag record.
export const requestTag = (tagId) =>
  makeRequest({
    url: `/api/v1/tags/${tagId}`,
    method: "GET",
  });

// Get multiple Tag records.
export const requestTags = (params) =>
  makeRequest({
    url: `/api/v1/tags`,
    body: params,
    method: "GET",
  });

// Get multiple Resource records.
export const requestResources = (params) =>
  makeRequest({
    url: `/api/v1/resources`,
    body: params,
    method: "GET",
  });

// Get a single Resource record.
export const requestResource = (resourceId) =>
  makeRequest({
    url: `/api/v1/resources/${resourceId}`,
    method: "GET",
  });

// Get Criteria records associated with a Resource.
export const requestResourceCriteria = (resourceId, params) =>
  makeRequest({
    url: `/api/v1/resources/${resourceId}/criteria`,
    body: params,
    method: "GET",
  });

// Get a single Set visible to current user.
export const requestSet = (setId) =>
  makeRequest({
    url: `/api/v1/sets/${setId}`,
    method: "GET",
  });

// Get multiple Set records visible to current user.
export const requestSets = (params) =>
  makeRequest({
    url: `/api/v1/sets`,
    body: params,
    method: "GET",
  });

// Get multiple Module records in a Set visible to current user.
export const requestSetModules = (setId, params) =>
  makeRequest({
    url: `/api/v1/sets/${setId}/modules`,
    body: params,
    method: "GET",
  });

// Get multiple Response records for a Set. Only the single most
// recent Response for a given Organization/Criterion will be reflected in
// the results. In practice, this endpoint will be callsed using various
// URL parameters to filter the results.
export const requestSetResponses = (setId, params) =>
  makeRequest({
    url: `/api/v1/sets/${setId}/responses`,
    body: params,
    method: "GET",
  });

// Get CriterionInstances in a Set visible to the current user.
export const requestSetCriterionInstances = (setId, params) =>
  makeRequest({
    url: `/api/v1/sets/${setId}/criterion-instances`,
    body: params,
    method: "GET",
  });

// Get Organizations with associated with a Set
export const requestSetOrganizations = (setId, params) => {
  return makeRequest({
    url: `/api/v1/sets/${setId}/organizations`,
    body: params,
    method: "GET",
  });
};

// Associate an Organization with a Set
export const requestLinkOrganizationSet = (setId, params) => {
  return makeRequest({
    url: `/api/v1/sets/${setId}/organizations`,
    body: params,
    method: "POST",
  });
};

// Disassociate an Organization from a Set
export const requestUnlinkOrganizationSet = (setId, organizationId) => {
  return makeRequest({
    url: `/api/v1/sets/${setId}/organizations/${organizationId}`,
    method: "DELETE",
  });
};

// Get Organizations in a US State. State IDs are the 2-character
// abbreviations, lowercase.
export const requestStateOrganizations = (stateId, params) =>
  makeRequest({
    url: `/api/v1/states/${stateId}/organizations`,
    body: params,
    method: "GET",
  });

// Get all SystemRoles records.
// Note: Available in redux under app_meta.
export const requestSystemRoles = () =>
  makeRequest({
    url: "/api/v1/system-roles",

    method: "GET",
  });

// Get all UserFunctionCategory records.
// Note: Available in redux under app_meta.
export const requestUserFunctionCategories = () =>
  makeRequest({
    url: "/api/v1/user-function-categories",
    method: "GET",
  });

// Get all UserFunction records.
// Note: Available in redux under app_meta.
export const requestUserFunctions = (params) =>
  makeRequest({
    url: "/api/v1/user-functions",
    body: params,
    method: "GET",
  });

// Get resources for a user function.
//
// Note: The endpoint accepts a param called `exactly` that accepts an integer specifying
// the exact number of items to return. In the event that there's not enough resources
// matching the user function or other filtering, the API will come up with others to
// serve to ensure the exactly number specified is returned.
export const requestUserFunctionResources = (ufId, params) =>
  makeRequest({
    url: `/api/v1/user-functions/${ufId}/resources`,
    body: params,
    method: "GET",
  });

// Get all Organizations a user is associated with.
export const requestUserOrganizations = (userId, params) =>
  makeRequest({
    url: `/api/v1/users/${userId}/organizations`,
    body: params,
    method: "GET",
  });

// Get the API-calculated "default" Organization for the current user (if any).
export const requestDefaultUserOrganization = () =>
  makeRequest({
    url: `/api/v1/users/default-organization`,
    method: "GET",
  });

// Get multiple User records.
export const requestUsers = (params) =>
  makeRequest({
    url: "/api/v1/users",
    body: params,
    method: "GET",
  });

// Get single User record.
export const requestUser = (userId) =>
  makeRequest({
    url: `/api/v1/users/${userId}`,
    method: "GET",
  });

// Get Reports available to current User. Each result record is an
// Organization that includes report-related data within.
export const requestUserReports = (userId, params) =>
  makeRequest({
    url: `/api/v1/users/${userId}/reports`,
    body: params,
    method: "GET",
  });

// -- OTHER / NEWLY RELOCATED (@TODO Organize)

/**
 * Request a password reset link to be sent via email.
 *
 * @param {String} email
 * @returns {Promise} Note that success response status is 202.
 */
export const requestPasswordResetForEmail = (email) => {
  return makeRequest({
    url: "/api/password/email",
    body: { email },
    method: "POST",
  });
};

/**
 * Change password afer a password reset email.
 *
 * @see requestPasswordResetForEmail()
 * @params {Object} payload
 *  Must have the following properties:
 *  - "email": User email
 *  - "password": New password
 *  - "password_confirmation": New password
 *  - "token": Token string from the reset email sent to user.
 * @returns {Promise} Note that success response status is 204.
 */
export const requestPasswordResetChangePassword = (payload) => {
  return makeRequest({
    url: "/api/password/reset",
    body: payload,
    method: "POST",
  });
};

/**
 * Change password for current user. (only valid for current user)
 *
 * @param  {Number} userId ID to change pw for
 * @param  {Object} payload Ex: `{password:'abc123', password_confirmation:'abc123'}`
 * @returns {Promise} Success response status is 200.
 */
export const requestChangeOwnPassword = (userId, payload) => {
  return makeRequest({
    url: `/api/v1/users/${userId}/change-password`,
    body: payload,
    method: "POST",
  });
};

export const requestDeactivateSelf = () => {
  // Endpoint returns 204 on success.
  return makeRequest({
    url: "/api/v1/account/deactivate",

    method: "GET",
  });
};

export const requestReactivateUser = (email) => {
  // Endpoint returns 202 on success.
  return makeRequest({
    url: "/api/account/reactivate",
    body: { email },
    method: "POST",
  });
};

export const requestLogin = (creds) => {
  // Endpoint returns 200 on success.
  return makeRequest({
    url: "/api/auth/login",
    body: creds,
    method: "POST",
    redirectOnAuthFailure: false,
  });
};

export const requestLogout = (creds) => {
  // Endpoint returns 200 on success, but a 401 if the user is already
  // logged-out. We treat both the same via the auth saga.
  return makeRequest({
    url: "/api/auth/logout",
    body: creds,
    method: "GET",
    // Disable redirect on auth failure because API may return a 4xx
    // if user is already logged-out.
    redirectOnAuthFailure: false,
  });
};

export const requestCsrfCookie = () => {
  // Endpoint returns 200 on success.
  return makeRequest({
    url: "/sanctum/csrf-cookie",
    method: "GET",
  });
};

export const requestAuthRefresh = () => {
  // Endpoint returns 200 on success.
  return makeRequest({
    url: "/api/auth/refresh",
    method: "POST",
  });
};

export const requestSelf = () => {
  // Endpoint returns 200 on success.
  return makeRequest({
    url: "/api/auth/me",
    method: "GET",
    throwOnFailure: "notauth", // expected to have auth fail sometimes
    redirectOnAuthFailure: false,
  });
};

export const requestRegister = (regData) => {
  // Endpoint returns 202 on success
  return makeRequest({
    url: "/api/auth/register",
    body: regData,
    method: "POST",
  });
};

export const requestProcessEmailVerificationToken = (vToken) => {
  // Endpoint returns:
  // - 200 Verified (first time for this token)
  // - 204 Token was previously verified
  // - 422 for failure to verify token
  return makeRequest({
    url: `/api/email/verify/${vToken}`,
    method: "GET",
  });
};

export const requestResendEmailVerificationMessage = (email) => {
  // Endpoint returns:
  // - 200 Will resend
  // - 422 Email already verified
  return makeRequest({
    url: `/api/email/resend`,
    body: { email },
    method: "POST",
  });
};
