import compareInvalidToValidators from './compareInvalidToValidators';

const validatorRef = {
  current: {
    invalid: [1, 3],
    props: {
      validators: ['validator1', 'validator2', 'validator3', 'validator4']
    }
  }
};

const expectedArray = ['validator2', 'validator4'];
const notExpectedArray = ['validator1', 'validator3'];

test('invalid array containing 1 and 3 creates an array containing validator2', () => {
  expect(compareInvalidToValidators(validatorRef)).toEqual(
    expect.arrayContaining(expectedArray)
  );
});

test('invalid array containing 1 and 3 creates an array not containing validator3', () => {
  expect(compareInvalidToValidators(validatorRef)).not.toEqual(
    expect.arrayContaining(notExpectedArray)
  );
});
