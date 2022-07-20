import convertStateToUrlParams from './convertStateToUrlParams';
import { cloneDeep } from 'lodash';

// Query string prefix used with URL parameters.
const testPrefix = 'pfx_';

// Mock values to be referenced in param and state mocks.
const testVals = {
  value1: 'value_1',
  value2: 'value_2'
};

// Mock component state.
const testState = {
  stateVar1: testVals.value1,
  stateVar2: testVals.value2
};

// Mock location object.
const testLocation = {
  search: `?${testPrefix}urlParam1=${testVals.value1}&${testPrefix}urlParam2=${testVals.value2}`
};

// Definition array passed to compareStateWithUrlParams().
const testDefinitions = [
  {
    stateName: 'stateVar1',
    paramName: 'urlParam1',
    defaultParamValue: 'default_1',
    valueType: 'str'
  },
  {
    stateName: 'stateVar2',
    paramName: 'urlParam2',
    defaultParamValue: 'default_2',
    valueType: 'str'
  }
];

test('State values are mapped to specified prefixed browser params', () => {
  const result = convertStateToUrlParams(
    testState,
    testLocation,
    testDefinitions,
    testPrefix
  );
  expect(result).toEqual({
    [`${testPrefix}urlParam1`]: testState.stateVar1,
    [`${testPrefix}urlParam2`]: testState.stateVar2
  });
});
