import { forEach, get } from 'lodash';

/**
 * Take the invalid array (array of numbers designating current errors
 * in validation), and compare it with the validators prop to create an
 * array of active validators
 *
 * @param {object} passwordValidatorRef
 * @returns {array} invalidMessages
 *  EX: ["minStringLength:7", "isPasswordUpperAndLower"]
 */
export default function compareInvalidToValidators(passwordValidatorRef) {
  let invalidmessages = [];
  let invalid = get(passwordValidatorRef, 'current.invalid', []);
  let validators = get(passwordValidatorRef, 'current.props.validators', []);

  forEach(invalid, i => {
    invalidmessages.push(validators[i]);
  });

  return invalidmessages;
}
