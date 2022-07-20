import { each, isNil, isNull } from 'lodash';

/**
 * Structure the data returned from
 * requestProgramOrganizationInfo().
 *
 *
 * Returns an object with simplified properties and methods.
 *
 * @param {Array} apiData
 * @returns {Object}
 */
export default function parseProgramOrganizationData(apiData) {
  let res = {
    program: {
      actualResponses: null,
      possibleResponses: null,
      values: {
        // EX:
        // {value_key_as_str}: Number (qty responses in PROG w/this value)
      },
      sets: {
        // EX:
        // {set_id}: {
        //   actualResponses: Number,
        //   possibleResponses: Number,
        //   values: {
        //     {value_key_as_str}: Number (qty responses in SET w/this value),
        //   },
        //   modules: {
        //     {module_id}: {
        //       actualResponses: Number,
        //       possibleResponses: Number,
        //       values: {
        //         {value_key}: Number (qty responses in MODULE w/this value),
        //     }
        //   }
        // }
      }
    }
  };

  // Find the result object with program totals.
  let progTotalsSummary = apiData.find(item => {
    return isNull(item.set_id) && isNull(item.module_id) && isNull(item.value);
  });

  res.program.actualResponses = progTotalsSummary
    ? Number(progTotalsSummary.total_responses)
    : 0;
  res.program.possibleResponses = progTotalsSummary
    ? Number(progTotalsSummary.total_possible)
    : 0;

  // Find the result objects with program totals by value.
  let progValueSummaries = apiData.filter(item => {
    return isNull(item.set_id) && isNull(item.module_id) && !isNull(item.value);
  });
  each(progValueSummaries, item => {
    res.program.values[String(item.value)] = Number(item.total_responses);
  });

  // Find the result objects with set totals.
  let setTotalsSummaries = apiData.filter(item => {
    return !isNull(item.set_id) && isNull(item.module_id) && isNull(item.value);
  });
  each(setTotalsSummaries, item => {
    if (isNil(res.program.sets[item.set_id])) {
      res.program.sets[item.set_id] = {
        modules: {},
        values: {}
      };
    }
    res.program.sets[item.set_id].actualResponses = Number(
      item.total_responses
    );
    res.program.sets[item.set_id].possibleResponses = Number(
      item.total_possible
    );
  });

  // Find the result objects with set totals by value.
  let setValueSummaries = apiData.filter(item => {
    return (
      !isNull(item.set_id) && isNull(item.module_id) && !isNull(item.value)
    );
  });
  each(setValueSummaries, item => {
    res.program.sets[item.set_id].values[String(item.value)] = Number(
      item.total_responses
    );
  });

  // Find the result objects with module totals.
  let moduleTotalsSummaries = apiData.filter(item => {
    return (
      !isNull(item.set_id) && !isNull(item.module_id) && isNull(item.value)
    );
  });
  each(moduleTotalsSummaries, item => {
    if (isNil(res.program.sets[item.set_id].modules[item.module_id])) {
      res.program.sets[item.set_id].modules[item.module_id] = {
        values: {}
      };
    }
    res.program.sets[item.set_id].modules[
      item.module_id
    ].actualResponses = Number(item.total_responses);
    res.program.sets[item.set_id].modules[
      item.module_id
    ].possibleResponses = Number(item.total_possible);
  });

  // Find the result objects with module totals by value.
  let moduleValueSummaries = apiData.filter(item => {
    return (
      !isNull(item.set_id) && !isNull(item.module_id) && !isNull(item.value)
    );
  });
  each(moduleValueSummaries, item => {
    if (isNil(res.program.sets[item.set_id].modules[item.module_id].values)) {
      res.program.sets[item.set_id].modules[item.module_id].values = {};
    }
    res.program.sets[item.set_id].modules[item.module_id].values[
      String(item.value)
    ] = Number(item.total_responses);
  });

  return res;
}
