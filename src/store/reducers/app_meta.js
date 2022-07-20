import { handleActions } from "redux-actions";
import { keyBy } from "lodash";
import { fetchAppMetaStart, fetchAppMetaSuccess, fetchAppMetaFailure } from "store/actions";

const initialState = {
  // Store the model trees.
  //
  // We'll key this object by the model type and the
  // model records themselves will be located immediately
  // beneath (no "data" prop wrapping them), mostly
  // keyed by their primary key.
  data: {
    allowedHtml: {},
    docbuilderQuestionTypes: {},
    docbuilders: {},
    gradeLevels: {},
    languages: {},
    organizationRoles: {},
    organizationTypes: {},
    responseStructures: {},
    userFunctions: {},
    userFunctionCategories: {},
    systemRoles: {},
  },

  // Whether we're currently loading items
  loading: false,

  // Whether we've attemped to load items yet
  // (leave true once set).
  loaded: false,

  // Whether latest request for item/items failed
  // (set false on new starts)
  failed: false,
};

export default handleActions(
  {
    [fetchAppMetaStart]: (state, { payload }) => ({
      ...state,
      loading: true,
      failed: false,
    }),
    [fetchAppMetaSuccess]: (state, { payload }) => ({
      ...state,
      loaded: true,
      loading: false,
      failed: false,
      data: {
        allowedHtml: payload["allowed-html"],
        docbuilderQuestionTypes: keyBy(payload.docbuilder_question_types, "id"),
        docbuilders: keyBy(payload.docbuilders, "id"),
        gradeLevels: keyBy(payload.grade_levels, "id"),
        languages: keyBy(payload.languages, "id"),
        organizationRoles: keyBy(payload.organization_roles, "id"),
        organizationTypes: keyBy(payload.organization_types, "id"),
        resourceTypes: keyBy(payload.resource_types, "id"),
        resourceTrainingTypes: keyBy(payload.resource_training_types, "id"),
        responseStructures: keyBy(payload.response_structures, "id"),
        userFunctions: keyBy(payload.user_functions, "id"),
        userFunctionCategories: keyBy(payload.user_function_categories, "id"),
        systemRoles: keyBy(payload.system_roles, "id"),
      },
    }),
    [fetchAppMetaFailure]: (state, { payload }) => ({
      ...state,
      loading: false,
      failed: true,
    }),
  },
  initialState
);
