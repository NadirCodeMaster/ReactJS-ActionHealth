import unitlessNumber from "./unitlessNumber";

test("Given a numeric string ending with px, return just number", () => {
  expect(unitlessNumber("10px")).toEqual(10);
  expect(unitlessNumber("0.5px")).toEqual(0.5);
  expect(unitlessNumber(".5px")).toEqual(0.5);
});

test("Given a numeric string ending with rem, return just number", () => {
  expect(unitlessNumber("10rem")).toEqual(10);
  expect(unitlessNumber("0.5rem")).toEqual(0.5);
  expect(unitlessNumber(".5rem")).toEqual(0.5);
});

test("Given a non-numeric string, return that string when passThroughNonNumeric=true", () => {
  expect(unitlessNumber("test", true)).toEqual("test");
});

test("Given a non-numeric string, return `0` when passThroughNonNumeric=false", () => {
  expect(unitlessNumber("test", false)).toEqual(0);
});

test("Given a non-string number value, return `0`", () => {
  expect(unitlessNumber(10)).toEqual(0);
  expect(unitlessNumber(0.5)).toEqual(0);
});
