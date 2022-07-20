import compareObjectIds from './compareObjectIds';
import { cloneDeep } from 'lodash';

const validObj1 = {
  id: 111,
  name: 'Object 1'
};

const validObj2 = {
  id: 222,
  name: 'Object 2'
};

test('Identical object IDs return true', () => {
  let cloneOfValidObj1 = cloneDeep(validObj1);
  let res = compareObjectIds(validObj1, cloneOfValidObj1);
  expect(res).toEqual(true);
});

test('Different object IDs return false', () => {
  let res = compareObjectIds(validObj1, validObj2);
  expect(res).toEqual(false);
});

test('Missing id property prevents match', () => {
  let cloneOfValidObj1 = cloneDeep(validObj1);
  delete cloneOfValidObj1.id;
  let res = compareObjectIds(cloneOfValidObj1, validObj1);
  expect(res).toEqual(false);
});

test('null object will not match', () => {
  let res = compareObjectIds(validObj1, null);
  expect(res).toEqual(false);
});

test('Empty object will not match', () => {
  let res = compareObjectIds(validObj1, {});
  expect(res).toEqual(false);
});
