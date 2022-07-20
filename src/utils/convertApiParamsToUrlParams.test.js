import convertApiParamsToUrlParams from './convertApiParamsToUrlParams';

const testApiRequestValues = {
  api_param_one: 'Param 1',
  api_param_two: 'Param 2',
  api_param_three: 'Param,3,has,commas',
  api_param_four: 'Param 4 has-dashes_and_underscores'
};

const testBrowserToApiParamsMap = {
  browser_param_one: 'api_param_one',
  browser_param_two: 'api_param_two',
  browser_param_three: 'api_param_three',
  browser_param_four: 'api_param_four'
};

const testQueryStringPrefix = 'pfx_';

test('API parameter values are mapped to specified browser params', () => {
  const result = convertApiParamsToUrlParams(
    testApiRequestValues,
    testBrowserToApiParamsMap,
    testQueryStringPrefix
  );
  expect(result).toEqual({
    [`${testQueryStringPrefix}browser_param_one`]: testApiRequestValues.api_param_one,
    [`${testQueryStringPrefix}browser_param_two`]: testApiRequestValues.api_param_two,
    [`${testQueryStringPrefix}browser_param_three`]: testApiRequestValues.api_param_three,
    [`${testQueryStringPrefix}browser_param_four`]: testApiRequestValues.api_param_four
  });
});

test('Excluded API parameters are omitted from result', () => {
  const result = convertApiParamsToUrlParams(
    testApiRequestValues,
    testBrowserToApiParamsMap,
    testQueryStringPrefix,
    ['api_param_three'] // the excluded api parameter
  );
  // Should _not_ match this one, which includes the excluded param three.
  expect(result).not.toEqual({
    [`${testQueryStringPrefix}browser_param_one`]: testApiRequestValues.api_param_one,
    [`${testQueryStringPrefix}browser_param_two`]: testApiRequestValues.api_param_two,
    [`${testQueryStringPrefix}browser_param_three`]: testApiRequestValues.api_param_three,
    [`${testQueryStringPrefix}browser_param_four`]: testApiRequestValues.api_param_four
  });
  // Should match this one, which excludes param three.
  expect(result).toEqual({
    [`${testQueryStringPrefix}browser_param_one`]: testApiRequestValues.api_param_one,
    [`${testQueryStringPrefix}browser_param_two`]: testApiRequestValues.api_param_two,
    [`${testQueryStringPrefix}browser_param_four`]: testApiRequestValues.api_param_four
  });
});
