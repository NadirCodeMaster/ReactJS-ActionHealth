import DocbuilderUtils from "../DocbuilderUtils";
import moment from "moment";

test("Non-closing docbuilders return -1", () => {
  let res;
  let d = {
    closed: false,
    closed_at: null,
  };

  // With a future nowDatetime...
  res = DocbuilderUtils.calculateTimeUntilClosed(d, 5000, "5000-01-01 14:55:55");
  expect(res).toEqual(-1);

  // With a past nowDatetime...
  res = DocbuilderUtils.calculateTimeUntilClosed(d, 5000, "2000-01-01 14:55:55");
  expect(res).toEqual(-1);
});

test("Closed docbuilders return 0", () => {
  let res;
  let closedAt = "2000-01-01 14:00:00";
  let nowDatetimeUtc = "2000-02-01 14:00:00";
  let d = {
    closed: true,
    closed_at: closedAt,
  };

  // With a nowDatetime that's after the closed_at value...
  res = DocbuilderUtils.calculateTimeUntilClosed(d, 5000, nowDatetimeUtc);
  expect(res).toEqual(0);
});

test("Future-closing docbuilders return correct diff from now in milliseconds", () => {
  let res;
  let closedAt = "2000-02-01 14:00:00";
  let nowDatetimeUtc = "2000-01-01 14:00:00";
  let buffer = 5000;

  // calculate expected diff
  let _closedAt = moment.utc(closedAt).valueOf();
  let _now = moment.utc(nowDatetimeUtc).valueOf();
  let expectedRes = _closedAt - buffer - _now;

  let d = {
    closed: true,
    closed_at: closedAt,
  };

  // With a nowDatetimeUtc that's before the closed_at value...
  res = DocbuilderUtils.calculateTimeUntilClosed(d, buffer, nowDatetimeUtc);
  expect(res).toEqual(expectedRes);
});
