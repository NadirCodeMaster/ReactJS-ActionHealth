import DocbuilderUtils from "../DocbuilderUtils";

test("Obj with `closed_at` value in the _past_ evaluates `true`", () => {
  let res;
  let closedAt = "2000-01-01 14:00:00";
  let nowDatetimeUtc = "2000-02-01 14:00:00";
  let d = {
    closed: true,
    closed_at: closedAt,
  };
  res = DocbuilderUtils.calculateClosed(d, nowDatetimeUtc);
  expect(res).toEqual(true);

  // try with flipped `closed` value.
  d.closed = !d.closed;
  res = DocbuilderUtils.calculateClosed(d, nowDatetimeUtc);
  expect(res).toEqual(true);
});

test("Obj with `closed_at` value in the _future_ evaluates `false`", () => {
  let res;
  let closedAt = "2000-02-01 14:00:00";
  let nowDatetimeUtc = "2000-01-01 14:00:00";
  let d = {
    closed: false,
    closed_at: closedAt,
  };
  res = DocbuilderUtils.calculateClosed(d, nowDatetimeUtc);
  expect(res).toEqual(false);

  // try with flipped `closed` value.
  d.closed = !d.closed;
  res = DocbuilderUtils.calculateClosed(d, nowDatetimeUtc);
  expect(res).toEqual(false);
});

test("Obj with `closed_at=null` evaluates `false`", () => {
  let res;
  let nowDatetimeUtc = "2000-01-01 14:00:00";
  let d = {
    closed: false,
    closed_at: null,
  };
  res = DocbuilderUtils.calculateClosed(d, nowDatetimeUtc);
  expect(res).toEqual(false);

  // try with flipped `closed` value.
  d.closed = !d.closed;
  res = DocbuilderUtils.calculateClosed(d, nowDatetimeUtc);
  expect(res).toEqual(false);
});
