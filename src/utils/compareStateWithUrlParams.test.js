import compareStateWithUrlParams from './compareStateWithUrlParams';
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

test('Identical state and URL parameter values should return true', () => {
  const res = compareStateWithUrlParams(
    testState,
    testLocation,
    testDefinitions,
    testPrefix
  );
  expect(res).toBe(true);
});

test('Unidentical state and URL parameter values should return false', () => {
  let _invalidState = cloneDeep(testState);
  _invalidState.stateVar1 = 'not the right value';

  const res = compareStateWithUrlParams(
    _invalidState,
    testLocation,
    testDefinitions,
    testPrefix
  );
  expect(res).toBe(false);
});

test('defaultParamValue should be evaluated in place of missing URL parameter', () => {
  // Setup for having default correctly match value in state.
  let _testState = cloneDeep(testState);
  let _testLocation = cloneDeep(testLocation);
  let _testDefinitions = cloneDeep(testDefinitions);
  _testState.varOnlyInState = 'not in url';
  _testDefinitions.push({
    stateName: 'varOnlyInState',
    paramName: 'paramThatDoesNotExist',
    defaultParamValue: _testState.varOnlyInState,
    valueType: 'str'
  });

  let res = compareStateWithUrlParams(
    _testState,
    _testLocation,
    _testDefinitions,
    testPrefix
  );
  expect(res).toBe(true);

  // Setup for having default correctly match value in state.
  _testState.varOnlyInState = 'not in url and not matching defaultParamValue';
  res = compareStateWithUrlParams(
    _testState,
    _testLocation,
    _testDefinitions,
    testPrefix
  );
  expect(res).toBe(false);
});

test('Value type definitions should resolve minor type differences', () => {
  // Setup to cast URL parameter (always string) to match number in state.
  let _testState = cloneDeep(testState);
  let _testLocation = cloneDeep(testLocation);
  let _testDefinitions = cloneDeep(testDefinitions);
  _testState.stateVar3 = 8; // as int/number
  _testLocation.search += `&${testPrefix}urlParam3=8`; // will be parsed as string
  _testDefinitions.push({
    stateName: 'stateVar3',
    paramName: 'urlParam3',
    defaultParamValue: 'default_3',
    valueType: 'num' // specify desired type
  });
  let res = compareStateWithUrlParams(
    _testState,
    _testLocation,
    _testDefinitions,
    testPrefix
  );
  expect(res).toBe(true);

  // Setup to cast numeric state value to parameter (always a string).
  _testState = cloneDeep(testState);
  _testLocation = cloneDeep(testLocation);
  _testDefinitions = cloneDeep(testDefinitions);
  _testState.stateVar3 = '8'; // as string
  _testLocation.search += `&${testPrefix}urlParam3=8`; // will be parsed as string
  _testDefinitions.push({
    stateName: 'stateVar3',
    paramName: 'urlParam3',
    defaultParamValue: 'default_3',
    valueType: 'string' // specify desired type
  });
  res = compareStateWithUrlParams(
    _testState,
    _testLocation,
    _testDefinitions,
    testPrefix
  );
  expect(res).toBe(true);
});

test('Missing state vars are treated as empty strings', () => {
  let _testState, _testLocation, _testDefinitions, res;

  // Setup for state object missing a value that's present in
  // definitions and in URL.
  _testState = cloneDeep(testState);
  delete _testState.stateVar2;

  // Should evaluate false and shouldn't generate errors.
  res = compareStateWithUrlParams(
    _testState,
    testLocation,
    testDefinitions,
    testPrefix
  );
  expect(res).toBe(false);

  // Setup for state object missing a value that's present in
  // definitions and in URL, and the URL value and default is empty.
  // Using valueType 'str'.
  _testState = cloneDeep(testState);
  _testLocation = cloneDeep(testLocation);
  _testDefinitions = cloneDeep(testDefinitions);
  _testLocation.search += `&${testPrefix}notInStateStr=`;
  _testDefinitions.push({
    stateName: 'not_here',
    paramName: 'notInStateStr',
    defaultParamValue: '',
    valueType: 'str' // specify desired type
  });

  // Should evaluate true and shouldn't generate errors.
  res = compareStateWithUrlParams(
    _testState,
    _testLocation,
    _testDefinitions,
    testPrefix
  );
  expect(res).toBe(true);

  // Setup for state object missing a value that's present in
  // definitions and in URL, and the URL value and default is empty.
  // Using valueType 'num'.
  _testState = cloneDeep(testState);
  _testLocation = cloneDeep(testLocation);
  _testDefinitions = cloneDeep(testDefinitions);
  _testLocation.search += `&${testPrefix}notInStateNum=`;
  _testDefinitions.push({
    stateName: 'not_here',
    paramName: 'notInStateNum',
    defaultParamValue: '',
    valueType: 'num' // specify desired type
  });

  // Should evaluate true and shouldn't generate errors.
  res = compareStateWithUrlParams(
    _testState,
    _testLocation,
    _testDefinitions,
    testPrefix
  );
  expect(res).toBe(true);
});
