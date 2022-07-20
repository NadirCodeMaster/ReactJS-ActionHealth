import makeRequest from 'api/makeRequest';

// FYI: There's a non-Axios API call in src/lib/Docbuilder/components/Docbuilder.js for
//      docbuilder CSS. It's not in this file because it returns as an actual content type
//      `type/css`, so it's called in using a regular HTML `<link />` tag.

// --------------
// GET Retrievals
// --------------

/**
 * Get docbuilder denylist.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3578
 */
export const requestDenylist = () => {
  return makeRequest({
    url: `/api/v1/docbuilder-denylist`,
    method: 'GET'
  });
};

/**
 * Get multiple docbuilder ANSWER records.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3569
 */
export const requestAnswers = params => {
  return makeRequest({
    url: `/api/v1/docbuilder-answers`,
    body: params,
    method: 'GET'
  });
};

/**
 * Get multiple DOCBUILDER records.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3564
 */
export const requestDocbuilders = params => {
  return makeRequest({
    url: `/api/v1/docbuilders`,
    body: params,
    method: 'GET'
  });
};

/**
 * Get multiple docbuilder FILE UPLOAD records.
 *
 * (returns records, not the binaries)
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/XXXX
 */
export const requestFileUploads = params => {
  return makeRequest({
    url: `/api/v1/docbuilder-uploads/files`,
    body: params,
    method: 'GET'
  });
};

/**
 * Get multiple docbuilder QUESTION records.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3568
 */
export const requestQuestions = params => {
  return makeRequest({
    url: `/api/v1/docbuilder-questions`,
    body: params,
    method: 'GET'
  });
};

/**
 * Get multiple docbuilder SECTION records.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3566
 */
export const requestSections = params => {
  return makeRequest({
    url: `/api/v1/docbuilder-sections`,
    body: params,
    method: 'GET'
  });
};

/**
 * Get multiple docbuilder SUBsection records.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3567
 */
export const requestSubsections = params => {
  return makeRequest({
    url: `/api/v1/docbuilder-subsections`,
    body: params,
    method: 'GET'
  });
};

/**
 * Get a single DOCBUILDER record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3565
 */
export const requestDocbuilder = idOrSlug => {
  return makeRequest({
    url: `/api/v1/docbuilders/${idOrSlug}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get single docbuilder FILE UPLOAD records.
 *
 * (returns records, not the binaries)
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/XXXX
 */
export const requestFileUpload = id => {
  return makeRequest({
    url: `/api/v1/docbuilder-uploads/files/${id}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get single docbuilder FILE UPLOAD _file_.
 *
 * Returns the binaries, not the records.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/XXXX
 */
export const requestFileUploadFile = id => {
  return makeRequest({
    url: `/api/builder-uploads/files/${id}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get a single docbuilder SECTION record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3574
 */
export const requestSection = id => {
  return makeRequest({
    url: `/api/v1/docbuilder-sections/${id}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get a single docbuilder SUBsection record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3575
 */
export const requestSubsection = id => {
  return makeRequest({
    url: `/api/v1/docbuilder-subsections/${id}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get processed DOCBUILDER markup array, string or binary.
 *
 * Response codes for "preview" and "final"
 * - 200 when valid and allowed (even when docbuilder processing
 *   "problems" are present).
 *
 * Response codes for "binary" and "html"
 * - 200 when valid and allowed
 * - 419 when not valid
 *
 * API ticket: https://github.com/alliance/cms/issues/3573
 */
export const requestProcessedDocbuilder = (
  docbuilderIdOrSlug,
  organizationId,
  mode = 'preview' // 'preview'|'final'|'binary'|'html'
) => {
  return makeRequest({
    url: `/api/v1/docbuilders/${docbuilderIdOrSlug}/organizations/${organizationId}/doc/${mode}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get meta handler data for an org/doc.
 *
 * API ticket: https://github.com/alliance/cms/issues/4064
 */
export const requestDocbuilderMetaForOrg = (
  docbuilderIdOrSlug,
  organizationId,
  handler,
  action = 'status'
) => {
  return makeRequest({
    url: `/api/v1/docbuilders/${docbuilderIdOrSlug}/organizations/${organizationId}/meta/${handler}?action=${action}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get global DOCBUILDER vars processed for a given org.
 *
 * Return payload is an object with two properties (meta and system),
 * each with their corresponding child values. Section-level variables
 * are not included.
 *
 * Response codes:
 * - 200 when valid and allowed (even when docbuilder processing
 *   "problems" are present).
 *
 * API ticket: https://github.com/alliance/cms/issues/3850
 */
export const requestDocbuilderVarsForOrg = (docbuilderIdOrSlug, organizationId) => {
  return makeRequest({
    url: `/api/v1/docbuilders/${docbuilderIdOrSlug}/organizations/${organizationId}/vars`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get processed SECTION markup.
 *
 * Response codes:
 * - 200 when valid and allowed (even when docbuilder processing
 *   "problems" are present).
 *
 * API ticket: https://github.com/alliance/cms/issues/3576
 */
export const requestProcessedSection = (
  sectionId,
  organizationId,
  mode = 'preview' // 'preview'|'final'
) => {
  return makeRequest({
    url: `/api/v1/docbuilder-sections/${sectionId}/organizations/${organizationId}/${mode}`,
    body: null,
    method: 'GET'
  });
};

/**
 * Get processed SUBsection markup.
 *
 * Response codes:
 * - 200 when valid and allowed (even when docbuilder processing
 *   "problems" are present).
 *
 * API ticket: https://github.com/alliance/cms/issues/3577
 */
export const requestProcessedSubsection = (
  subsectionId,
  organizationId,
  mode = 'preview' // 'preview'|'final'
) => {
  return makeRequest({
    url: `/api/v1/docbuilder-subsections/${subsectionId}/organizations/${organizationId}/${mode}`,
    body: null,
    method: 'GET'
  });
};

// ------
// Create
// ------

/**
 * Create a DOCBUILDER record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3580
 */
export const requestCreateDocbuilder = dataObj => {
  return makeRequest({
    url: `/api/v1/docbuilders`,
    body: dataObj,
    method: 'POST'
  });
};

/**
 * Create (upload) a docbuilder FILE.
 *
 * For example, when uploading via file_uploads_v1 question type.
 *
 * Response codes:
 * - ??? when ok
 *
 * @param {Blob} fileData
 *  Actual file data to store.
 * @param {Object} meta
 *  Container object for supporting meta data. All elements are required.
 * @param {integer} meta.organization_id
 *  (within meta) Associated org ID.
 * @param {integer} meta.docbuilder_question_id
 *  (within meta) Associated question ID.
 * @param {array} meta.file_types
 *  (within meta) Array of file types (extensions) FE wants allowed. This is
 *  an aid to the UI, not a security measure. The submitted extensions are
 *  cross-checked by the API with types it allows globally.
 *
 */
export const requestCreateFileUpload = (fileData, meta) => {
  let _oId = parseInt(meta.organization_id, 10);
  let _qId = parseInt(meta.docbuilder_question_id, 10);
  let _ft = meta.file_types
    .map(v => {
      return encodeURIComponent(v);
    })
    .join(',');

  // Body needs to be a FormData, so create one and move
  // the values inside.
  let requestBody = new FormData();
  requestBody.append('docbuilder_file', fileData);
  requestBody.append('docbuilder_question_id', _qId);
  requestBody.append('file_types', _ft);
  requestBody.append('organization_id', _oId);

  return makeRequest({
    url: `/api/v1/docbuilder-uploads/files`,
    body: requestBody,
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    contentType: 'multipart/form-data'
  });
};

/**
 * Create a docbuilder QUESTION record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3583
 */
export const requestCreateQuestion = dataObj => {
  return makeRequest({
    url: `/api/v1/docbuilder-questions`,
    body: dataObj,
    method: 'POST'
  });
};

/**
 * Create a docbuilder SECTION record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3581
 */
export const requestCreateSection = dataObj => {
  return makeRequest({
    url: `/api/v1/docbuilder-sections`,
    body: dataObj,
    method: 'POST'
  });
};

/**
 * Create a docbuilder SUBsection record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3582
 */
export const requestCreateSubsection = dataObj => {
  return makeRequest({
    url: `/api/v1/docbuilder-subsections`,
    body: dataObj,
    method: 'POST'
  });
};

// ------
// Update
// ------

/**
 * Update a DOCBUILDER record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3580
 */
export const requestUpdateDocbuilder = (dataObj, docbuilderId) => {
  return makeRequest({
    url: `/api/v1/docbuilders/${docbuilderId}`,
    body: dataObj,
    method: 'PUT'
  });
};

/**
 * Update a docbuilder QUESTION record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3583
 */
export const requestUpdateQuestion = (dataObj, questionId) => {
  return makeRequest({
    url: `/api/v1/docbuilder-questions/${questionId}`,
    body: dataObj,
    method: 'PUT'
  });
};

/**
 * Update a docbuilder SECTION record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3581
 */
export const requestUpdateSection = (dataObj, sectionId) => {
  return makeRequest({
    url: `/api/v1/docbuilder-sections/${sectionId}`,
    body: dataObj,
    method: 'PUT'
  });
};

/**
 * Update a docbuilder SUBsection record.
 *
 * Response codes:
 * - 200 when ok
 *
 * API ticket: https://github.com/alliance/cms/issues/3582
 */
export const requestUpdateSubsection = (dataObj, subsectionId) => {
  return makeRequest({
    url: `/api/v1/docbuilder-subsections/${subsectionId}`,
    body: dataObj,
    method: 'PUT'
  });
};

/**
 * Create OR update a docbuilder answer.
 *
 * Response codes:
 * - 201 if answer did not yet exist and was successfully created
 * - 200 if answer did exist and was successfully updated
 *
 * API ticket: https://github.com/alliance/cms/issues/3579
 */
export const requestSubmitAnswer = (organizationId, docbuilderQuestionId, answerValue) => {
  let payload = {
    organization_id: organizationId,
    docbuilder_question_id: docbuilderQuestionId,
    value: JSON.stringify(answerValue)
  };

  return makeRequest({
    url: `/api/v1/docbuilder-answers`,
    body: payload,
    method: 'PUT'
  });
};

// Submit doc for a submittable docbuilder.
// Should return 200, submittable object representation on success.
export const requestSubmitSubmittableDocbuilder = (docbuilderIdOrSlug, organizationId) => {
  return makeRequest({
    url: `/api/v1/docbuilders/${docbuilderIdOrSlug}/organizations/${organizationId}/meta/submittable?action=submit`,
    method: 'PUT'
  });
};

// Unsubmit doc for a submittable docbuilder.
// Should return status 204, no payload on success.
export const requestUnsubmitSubmittableDocbuilder = (docbuilderIdOrSlug, organizationId) => {
  return makeRequest({
    url: `/api/v1/docbuilders/${docbuilderIdOrSlug}/organizations/${organizationId}/meta/submittable?action=unsubmit`,
    method: 'PUT'
  });
};

// ------
// Delete
// ------

// Delete a Docbuilder record.
export const requestDeleteDocbuilder = docbuilderId =>
  makeRequest({
    url: `/api/v1/docbuilders/${docbuilderId}`,
    method: 'DELETE'
  });

// Delete a File Upload record.
export const requestDeleteFileUpload = fileId =>
  makeRequest({
    url: `/api/v1/docbuilder-uploads/files/${fileId}`,
    method: 'DELETE'
  });

// Delete a Section record.
export const requestDeleteSection = sectionId =>
  makeRequest({
    url: `/api/v1/docbuilder-sections/${sectionId}`,
    method: 'DELETE'
  });

// Delete a Subsection record.
export const requestDeleteSubsection = subsectionId =>
  makeRequest({
    url: `/api/v1/docbuilder-subsections/${subsectionId}`,
    method: 'DELETE'
  });

// Delete a Question record.
export const requestDeleteQuestion = questionId =>
  makeRequest({
    url: `/api/v1/docbuilder-questions/${questionId}`,
    method: 'DELETE'
  });

// Delete an answer.
// This bypasses validation that would otherwise prevent
// a required question from being cleared.
export const requestDeleteAnswer = (organizationId, docbuilderQuestionId) => {
  let payload = {
    organization_id: organizationId,
    docbuilder_question_id: docbuilderQuestionId
  };

  return makeRequest({
    url: `/api/v1/docbuilder-answers`,
    body: payload,
    method: 'DELETE'
  });
};
