import draftEditorTextIsEmpty from './draftEditorTextIsEmpty';

let jsonStrWithEmptyText =
  '{"blocks": [{"key": "3d020", "data": [], "text": "", "type": "unstyled", "depth": 0, "entityRanges": [], "inlineStyleRanges": []}], "entityMap": {}}';

let jsonStrWithNonEmptyText =
  '{"blocks": [{"key": "3d020", "data": [], "text": "hey now", "type": "unstyled", "depth": 0, "entityRanges": [], "inlineStyleRanges": []}], "entityMap": {}}';

test('null is considered empty', () => {
  let v = null;
  expect(draftEditorTextIsEmpty(v)).toEqual(true);
});

test('false is considered empty', () => {
  let v = false;
  expect(draftEditorTextIsEmpty(v)).toEqual(true);
});

test('undefined is considered empty', () => {
  let v = undefined;
  expect(draftEditorTextIsEmpty(v)).toEqual(true);
});

test('Draft-formatted JSON string with empty text property is considered empty', () => {
  expect(draftEditorTextIsEmpty(jsonStrWithEmptyText)).toEqual(true);
});

test('Draft-formatted JSON object with empty text property is considered empty', () => {
  let jsonObj = JSON.parse(jsonStrWithEmptyText);
  expect(draftEditorTextIsEmpty(jsonObj)).toEqual(true);
});

test('JSON string without blocks property is considered empty', () => {
  let jsonStr = '{}';
  expect(draftEditorTextIsEmpty(jsonStr)).toEqual(true);
});

test('JSON object without blocks property is considered empty', () => {
  let jsonStr = '{}';
  let jsonObj = JSON.parse(jsonStr);
  expect(draftEditorTextIsEmpty(jsonObj)).toEqual(true);
});

test('JSON string with non-empty text is considered not empty', () => {
  expect(draftEditorTextIsEmpty(jsonStrWithNonEmptyText)).toEqual(false);
});

test('JSON object with non-empty text is considered not empty', () => {
  let jsonObj = JSON.parse(jsonStrWithNonEmptyText);
  expect(draftEditorTextIsEmpty(jsonObj)).toEqual(false);
});
