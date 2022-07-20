import remToPxNumber from "./remToPxNumber";

test("Given a `rem` value, equivalent numeric px value is returned", () => {
  expect(remToPxNumber("1rem")).toEqual(10);
  expect(remToPxNumber("1.2rem")).toEqual(12);
  expect(remToPxNumber("0.5rem")).toEqual(5);
});

test("Given an unacceptable value, `0` is returned", () => {
  expect(remToPxNumber("test")).toEqual(0);
  expect(remToPxNumber("test123")).toEqual(0);
  expect(remToPxNumber("normal")).toEqual(0);
  expect(remToPxNumber("rem123")).toEqual(0);
});
