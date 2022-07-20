import React, { Fragment, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { usePrevious } from "state-hooks";
import { useHistory, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  debounce,
  difference,
  get,
  has,
  find,
  forOwn,
  includes,
  isArray,
  isEmpty,
  isNil,
  isObject,
  isString,
  values,
} from "lodash";
import { Box, Fade, Modal, Paper } from "@mui/material";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import PageNotFound from "components/views/PageNotFound";
import { organizationShape } from "constants/propTypeShapes";
import DocbuilderUtils from "../classes/DocbuilderUtils";
import SubsectionProcessor from "../classes/SubsectionProcessor";
import questionsForDocbuilder from "../utils/question/questionsForDocbuilder";
import sectionFromDocbuilder from "../utils/section/sectionFromDocbuilder";
import subsectionFromDocbuilder from "../utils/subsection/subsectionFromDocbuilder";
import {
  requestAnswers,
  requestDeleteAnswer,
  requestDocbuilder,
  requestDocbuilderMetaForOrg,
  requestDocbuilderVarsForOrg,
  requestProcessedDocbuilder,
  requestProcessedSection,
  requestSubmitAnswer,
} from "../requests";
import Build from "./Build";
import Preview from "./Preview";
import ModalFinal from "./ModalFinal";
import ModalSubsection from "./ModalSubsection";
import subsectionsWithoutQuestionsForDocbuilder from "../utils/subsection/subsectionsWithoutQuestionsForDocbuilder";
import subsectionsWithQuestionsForDocbuilder from "../utils/subsection/subsectionsWithQuestionsForDocbuilder";
import sectionShouldBeNumberedInPreview from "../utils/section/sectionShouldBeNumberedInPreview";
import { statuses } from "../utils/subsection/constants";
import UIContent from "../classes/UIContent";
import Submittable from "../classes/MetaHandlers/Submittable";
import { Markup } from "interweave";

//
// Renders a docbuilder using the specified format ("build" or "preview").
//
// This component is a wrapper for those two, providing shared values
// and functionality as appropriate.
//

// @TODO Exit final modal via escape doesn't alter
//       address bar location, which prevents re-opening
//       of modal for subsection previously open.
//       Close button works fine.

export default function Docbuilder({
  docbuilderSlug,
  format,
  organization,
  subsectionId,
  userCanEditDocbuilders,
  userCanViewDocbuilders,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const subsectionModalContentContainerRef = useRef(null);
  const finalModalContentContainerRef = useRef(null);

  const history = useHistory();
  const location = useLocation();

  const [subsectionForModal, setSubsectionForModal] = useState(null);
  const [subsectionModalOpen, setSubsectionModalOpen] = useState(false);
  const [finalModalOpen, setFinalModalOpen] = useState(false);
  const [loadingDocbuilder, setLoadingDocbuilder] = useState(false);
  const [docbuilder, setDocbuilder] = useState(null);
  const [docbuilderAvailableForOrgType, setDocbuilderAvailableForOrgType] = useState(null); // null (not checked) | false | true
  const [docbuilderIsClosed, setDocbuilderIsClosed] = useState(false); // @see DocbuilderUtils.calculateClosed()
  const [docbuilderVars, setDocbuilderVars] = useState(null);

  // Support for UI content.
  const [uic, setUic] = useState(null);

  // -- @see UIContent.submittableValues
  const [uicStateKeyValue1, setUicStateKeyValue1] = useState(UIContent.tbdValue);
  // -- @see UIContent.requirementsMetValues
  const [uicStateKeyValue2, setUicStateKeyValue2] = useState(UIContent.tbdValue);
  // -- @see UIContent.submittableStatusValues
  const [uicStateKeyValue3, setUicStateKeyValue3] = useState(UIContent.tbdValue);

  // Stores combined representation of state key values above.
  const [uicStateKey, setUicStateKey] = useState(UIContent.tbdStateKey);

  // Dedicated representation of whether all requirements have been met
  // for the active doc.
  const [requirementsMet, setRequirementsMet] = useState(false);

  // All docbuilders, as stored in app_meta/redux.
  const allDocbuilders = useSelector((state) => state.app_meta.data.docbuilders);

  // Stores content from UIC keyed by slot.
  //
  // Always safe to call its properties without testing for
  // existence fist because they are initialized with empty
  // strings via uicSlotsInitValue().
  const [uicSlots, setUicSlots] = useState(uicSlotsInitValue());

  // Submittable status calculated from meta handler data from API.
  const [submittableStatus, setSubmittableStatus] = useState(
    Submittable.submittableStatuses.UNKONWN
  );

  // `prevFormat`: Previous value of `format` prop.
  const prevFormat = usePrevious(format);

  // Prevent changes, as when a docbuilder is closed or doc is submitted.
  const [readOnly, setReadOnly] = useState(false);

  // Dictionary of section ID => section number (or null).
  const [sectionNumbering, setSectionNumbering] = useState({});

  // `answers`: Object keyed by question IDs.
  // This may be passed along to child components.
  const [answers, dispatchAnswersReducer] = useReducer(answersReducer, {});

  // `prevAnswers`: Previous value of `answers`.
  const prevAnswers = usePrevious(answers);

  // `loadingFullPreview`: When `true`, indicates we have a full content reload in
  // progress. This most often occurs when first navigating to the preview page
  // for a docbuilder, but other circumstances may trigger it as well.
  // Since there are multiple situations that may trigger this, be cautious when
  // making a change to the UI based on its state.
  const [loadingFullPreview, setLoadingFullPreview] = useState(false);

  // `previewContent`: Store of doc preview HTML structured as an object keyed
  // by subsection IDs, each value a subsection object with an additional
  // property called `_render` that contains its HTML (string). Only needs to be
  // populated/updated when we're in the preview display (at least as of this
  // writing), but administered here for simpler integration with events/data
  // from other places and potential future use cases.
  const [previewContent, dispatchPreviewContentReducer] = useReducer(previewContentReducer, {});

  // `outdatedSectionPreviews`: Array of section IDs that need to have their
  // preview content refreshed (inside `previewContent`). Primary use case
  // at this time is upon the closing of a subsection modal (since questions
  // in a subsection can impact the final content of other subsections in the
  // same section, we'll typically reload content for all subsections in that
  // section). Note: Don't use this to load an entire docbuilder preview.
  const [outdatedSectionPreviews, dispatchOutdatedSectionPreviewsReducer] = useReducer(
    outdatedSectionPreviewsReducer,
    []
  );

  // `subsectionStatuses`: Object keyed by subsection IDs w/status values.
  // This may be passed along to child components.
  const [subsectionStatuses, dispatchSubsectionStatusesReducer] = useReducer(
    subsectionStatusesReducer,
    {}
  );

  // Establish if active docbuilder is allowed for current org.
  useEffect(() => {
    // We'll set docbuilderAvailableForOrgType based on what we find:
    //
    // - null: we haven't checked because we don't have enough info
    // - false: we checked and it's NOT allowed
    // - true: we checked and it's allowed
    let newDAFOT = null;

    // Only set as actual bool if we have the docbuidler and organization
    // objects available.
    if (docbuilder && organization) {
      newDAFOT = false; // assume not allowed

      // Array of docbuilders available to current org based on its type.
      let avail = DocbuilderUtils.docbuildersForOrganization(allDocbuilders, organization, true);
      if (isArray(avail)) {
        let thisDocbuilder = find(avail, function (d) {
          return docbuilder.machine_name === d.machine_name;
        });
        if (thisDocbuilder) {
          // Found the current docbuilder, so it's allowed.
          newDAFOT = true;
        }
      }
    }
    if (mounted.current) {
      setDocbuilderAvailableForOrgType(newDAFOT);
    }
  }, [allDocbuilders, docbuilder, organization]);

  // Instantiate a UIC instance and related values when docbuilder changes.
  useEffect(() => {
    // Set-up UIContent instance, initialize the uicStateKey.
    let newUic = null;
    let newUicStateKeyValue1 = UIContent.tbdValue;
    if (docbuilder && organization) {
      if (mounted.current) {
        // Get submittable meta from API. Response will be evaluated
        // upon receipt in the fetch method.
        fetchSubmittableMeta(docbuilder, organization);
      }
      newUic = new UIContent(docbuilder);
      newUicStateKeyValue1 = UIContent.calculateSubmittableValue(docbuilder);
    }
    if (mounted.current) {
      setUic(newUic);
      setUicStateKeyValue1(newUicStateKeyValue1);
      setUicStateKeyValue2(UIContent.tbdValue);
      setUicStateKeyValue3(UIContent.tbdValue);
    }
  }, [docbuilder, organization]);

  // Retrieve and apply submittable meta from server.
  const fetchSubmittableMeta = (_docbuilder, _organization) => {
    if (!_docbuilder || !_docbuilder.submittable || !_organization) {
      setSubmittableStatus(Submittable.submittableStatuses.UNKNOWN);
      return;
    }
    requestDocbuilderMetaForOrg(_docbuilder.id, _organization.id, "submittable")
      .then((res) => {
        let theMeta = null;
        let newSubmittableStatus = Submittable.submittableStatuses.UNKNOWN;
        if (has(res, "data") && !isEmpty(res.data)) {
          theMeta = get(res, "data.submittable", null);
          newSubmittableStatus = Submittable.calculateSubmittableStatus(_docbuilder, theMeta);
        }
        if (mounted.current) {
          // Update submittable status info.
          setSubmittableStatus(newSubmittableStatus);
        }
      })
      .catch((err) => {
        console.error("Error fetching submittable meta");
      });
  };

  // Maybe adjust readOnly status when submittableStatus, docbuilderIsClosed changes.
  useEffect(() => {
    let newReadOnly = false;
    if (
      docbuilderIsClosed ||
      submittableStatus === Submittable.submittableStatuses.SUBMITTED_AND_PENDING ||
      submittableStatus === Submittable.submittableStatuses.SUBMITTED_AND_LOCKED
    ) {
      newReadOnly = true;
    }
    setReadOnly(newReadOnly);
  }, [docbuilderIsClosed, submittableStatus]);

  // Modify requirementsMet _AND_ uicStateKey value 2 (requirements met info)
  // when subsection statuses change
  useEffect(() => {
    // Unlike the final download/submit modal, which checks with the
    // server to determine if we list errors, all we do here is look
    // for "pending" statuses. However, this is kind of a shortcut
    // around the official method, so watch for potential bugs with
    // momentary states or other edge case scenarios.
    let newRequirementsMet;
    let newUicStateKeyValue2;

    if (includes(subsectionStatuses, statuses.PENDING)) {
      // Found a pending subsection, so requirements are not yet met.
      newRequirementsMet = false;
      newUicStateKeyValue2 = UIContent.requirementsMetValues.NO;
    } else {
      // Otherwise, should be okay.
      newRequirementsMet = true;
      newUicStateKeyValue2 = UIContent.requirementsMetValues.YES;
    }

    setRequirementsMet(newRequirementsMet);
    setUicStateKeyValue2(newUicStateKeyValue2);
  }, [subsectionStatuses]);

  // Modify uicStateKey value 3 (submittable status) when submittableStatus changes.
  useEffect(() => {
    setUicStateKeyValue3(UIContent.submittableStatusValueFromSubmittableStatus(submittableStatus));
  }, [submittableStatus]);

  // Open/close the download modal.
  //
  // Intended to be passed along to child components.
  const toggleDownloadModal = useCallback((open) => {
    open = !!open; // ensure it's a pure bool
    setFinalModalOpen(open);
  }, []);

  // Open/close the subsection modal.
  //
  // Can be passed along to child components.
  const toggleSubsectionModal = useCallback((open) => {
    open = !!open; // ensure it's a pure bool
    setSubsectionModalOpen(open);
  }, []);

  /**
   * Add/update answer objects in our `answers` state var.
   *
   * Use here or in child components.
   *
   * @param {array} newAnswersArray
   *  New or updated answers to be merged into our answers state var.
   *  Avoid inclusion of answers that are not associated with the subject
   *  docbuilder since that will require unnecessary processing.
   */
  const addOrUpdateAnswers = useCallback((newAnswersArray) => {
    if (!isArray(newAnswersArray)) {
      console.error("non-array received by addOrUpdateAnswers()");
      return;
    }
    dispatchAnswersReducer({
      type: "add",
      payload: newAnswersArray,
    });
  }, []);

  /**
   * Remove a question from our component answers store.
   *
   * Use this if nullifying an answer at the API so the change
   * is reflected without us reloading all answers.
   *
   * @param {number} questionId
   */
  const removeAnswerFromState = useCallback((questionId) => {
    dispatchAnswersReducer({
      type: "remove",
      payload: [questionId],
    });
  }, []);

  /**
   * Delete an answer from server and component state.
   *
   * @param {number} organizationId
   * @param {number} questionId
   * @param {function|null} callback
   */
  const deleteAnswer = useCallback(
    (organizationId, questionId, callback = null) => {
      requestDeleteAnswer(organizationId, questionId)
        .then((res) => {
          if (mounted.current) {
            // Remove question from answers store.
            removeAnswerFromState(questionId);
            if (callback) {
              callback();
            }
          }
        })
        .catch((err) => {
          console.error(err.message);
          if (mounted.current) {
            if (callback) {
              callback();
            }
          }
        });
    },
    [removeAnswerFromState]
  );

  /**
   * Retrieve global template vars for this docbuilder/org combo.
   *
   * Populates docbuilderVars state var.
   *
   * NOTE: The eslint line disable is to prevent warning about "useCallback
   *       received a function whose dependencies are unknown" that comes
   *       from using debounce().
   *
   */
  // eslint-disable-next-line
  const retrieveDocbuilderVars = useCallback(
    debounce(() => {
      requestDocbuilderVarsForOrg(docbuilderSlug, organization.id)
        .then((res) => {
          // If status code ok, incorporate the resulting content.
          if (200 === res.status) {
            // Make sure each child element is an object.
            // (there was temporarily an issue where an empty element would
            //  come through as an array, so this just protects against that).
            let varsObj = res.data;
            forOwn(varsObj, (value, key) => {
              if (!isObject(value)) {
                varsObj[key] = {};
              }
            });
            setDocbuilderVars(varsObj);
          }
        })
        .catch((err) => {
          console.error("An error occurred in retrieveDocbuilderVars.", err);
        });
    }, 300),
    [docbuilderSlug, organization]
  );

  // Trigger retrieveDocbuilderVars() when vars change.
  useEffect(() => {
    retrieveDocbuilderVars();
  }, [docbuilderSlug, organization, retrieveDocbuilderVars]);

  /**
   * Retrieve preview content for entire docbuilder.
   *
   * Calling code should only use this when `format` is set to `preview`,
   * since it's not otherwise necessary.
   */
  const retrieveDocbuilderPreviewContent = useCallback(() => {
    setLoadingFullPreview(true);
    requestProcessedDocbuilder(docbuilderSlug, organization.id, "preview")
      .then((res) => {
        // If status code ok, incorporate the resulting content.
        if (200 === res.status) {
          // Handle if problems reported.
          if (res.data.problems.length > 0) {
            console.log(
              // Leave in place for potential debugging
              "Problems reported in preview content",
              res.data.problems
            );
          }

          // As long as it was a 200, we should have content we can add.
          if (mounted.current) {
            dispatchPreviewContentReducer({
              type: "add",
              payload: res.data.content,
            });
          }

          if (mounted.current) {
            setLoadingFullPreview(false);
          }
        }

        // If we're here in the success callback but the result wasn't
        // a 200 status, something unexpected happened.
        else {
          console.warn("Unexpected result in retrieveDocbuilderPreviewContent.", res);
        }
      })
      .catch((err) => {
        console.error("An error occurred in retrieveDocbuilderPreviewContent.", err);
      });
  }, [docbuilderSlug, organization]);

  /**
   * Queue a reload of preview content if/when appropriate.
   *
   * Using the provided section ID and active prop/state values, this method
   * will establish whether we need to (re)load preview content and how much.
   *
   * It's only necessary to load preview content when we're viewing the
   * preview `format`. The scope of the preview content we load is determined
   * by the subsection. Changes to a "meta" section can impact the entire doc,
   * so we retrieve everything; other sections are relatively self-contained
   * so we just reload their content.
   *
   * If sectionId is null, we consider it a request to reload all preview
   * content for the current docbuilder (but still only if format is preview).
   *
   * @param {number|null}
   *
   */
  const maybeReloadPreviewContent = useCallback(
    (sectionId) => {
      if ("preview" === format) {
        if (!sectionId) {
          // Do a full preview reload.
          retrieveDocbuilderPreviewContent();
        } else {
          let section = sectionFromDocbuilder(docbuilder, sectionId);
          if (section) {
            if (section.is_meta) {
              // Do full preview reload.
              retrieveDocbuilderPreviewContent();
            } else {
              // Add section to the list of ones with outdated previews
              // so it can be handled.
              dispatchOutdatedSectionPreviewsReducer({
                type: "add",
                payload: [sectionId],
              });
            }
          }
        }
      }
    },
    [docbuilder, format, retrieveDocbuilderPreviewContent]
  );

  // Function to submit answers to the API.
  //
  // Answers in successful submissions will be merged into our
  // component answers object.
  const submitAnswer = useCallback(
    (organizationId, questionId, answerValue, sectionId, callback) => {
      // Declare accepted https statuses.
      let okStatuses = [200, 201];

      // Create the request promise.
      requestSubmitAnswer(organizationId, questionId, answerValue)
        .then((requestResult) => {
          if (!mounted.current) {
            return;
          }

          // Request appears to have succeeded.
          let isOk = true;

          if (includes(okStatuses, requestResult.status)) {
            // Submission was successful.
            // Returned answer record object should have a JSON string `value`
            // property that we need to convert to an object.
            let rData = get(requestResult, "data.data", {});
            if (rData.hasOwnProperty("value") && isString(rData.value)) {
              rData.value = JSON.parse(rData.value);
            }

            // Then merge the returned answer record
            // into the local answers reducer store.
            addOrUpdateAnswers([rData]);

            // And conditionally queue up a refresh of content based on
            // what section was changed.
            maybeReloadPreviewContent(sectionId);
          } else {
            // .. actually, the request didn't fail, but we got the
            // wrong status code back.
            isOk = false;
          }
          if (callback) {
            callback(isOk);
          }
          return requestResult;
        })
        .catch((err) => {
          if (!mounted.current) {
            return;
          }

          // Catch any errors and complete the promise.
          console.error("Docbuilder.js submitAnswer() failed. ", err);
          if (callback) {
            callback(false);
          }
        });
    },
    [addOrUpdateAnswers, maybeReloadPreviewContent]
  );

  // Retrieve _all_ preview content when format changes to 'preview'.
  useEffect(() => {
    if ("preview" === format && "preview" !== prevFormat) {
      retrieveDocbuilderPreviewContent();
    }
  }, [format, prevFormat, retrieveDocbuilderPreviewContent]);

  // Load the specified docbuilder and dependent values.
  useEffect(() => {
    // Only try when we know user has permission to do so and there's either
    // no docbuilder object yet OR the docbuilder doesn't match the slug we're
    // working with.
    if (userCanViewDocbuilders && (isNil(docbuilder) || docbuilder.slug !== docbuilderSlug)) {
      // ... and make sure we have a slug to request with.
      if (docbuilderSlug) {
        if (mounted.current) {
          setLoadingDocbuilder(true);
        }
        requestDocbuilder(docbuilderSlug)
          .then((res) => {
            if (!mounted.current) {
              return;
            }
            let newDocbuilderObj = get(res, "data.data", null);
            if (mounted.current) {
              setDocbuilder(newDocbuilderObj);
              setLoadingDocbuilder(false);
            }
          })
          .catch((err) => {
            if (mounted.current) {
              setDocbuilder(null);
              setLoadingDocbuilder(false);
            }
            console.error(err.message);
          });
      } else {
        // No slug, so unset docbuilder object if it's set.
        if (docbuilder && mounted.current) {
          setDocbuilder(null);
        }
      }
    }
  }, [userCanViewDocbuilders, docbuilder, docbuilderSlug]);

  // Populate and schedule future update of docbuilderIsClosed (if necessary),
  // upon a change to docbuilder.
  useEffect(() => {
    // Initial population.
    let newDocbuilderIsClosed = DocbuilderUtils.calculateClosed(docbuilder);
    if (mounted.current) {
      setDocbuilderIsClosed(newDocbuilderIsClosed);
    }

    // Schedule change to docbuilderIsClosed if appropriate.
    if (!newDocbuilderIsClosed) {
      // only need to do this if it's not already closed.
      let msUntilClosed = DocbuilderUtils.calculateTimeUntilClosed(docbuilder, 5000);
      if (msUntilClosed > 0) {
        const closeTimer = setTimeout(() => {
          if (mounted.current) {
            setDocbuilderIsClosed(true);
          }
        }, msUntilClosed);
        return () => clearTimeout(closeTimer);
      }
    }
  }, [docbuilder]);

  // Get subsectionForModal for subsectionId (if present) from docbuilder.
  useEffect(() => {
    let newSub = null;
    // Find the subsection that subsectionId belongs to inside docbuilder.
    if (!isNil(subsectionId) && !isNil(docbuilder)) {
      newSub = subsectionFromDocbuilder(docbuilder, subsectionId);
    }
    if (mounted.current) {
      setSubsectionForModal(newSub);
    }
  }, [docbuilder, subsectionId]);

  // Set subsection modal state based on value of subsection.
  useEffect(() => {
    if (mounted.current) {
      setSubsectionModalOpen(!isNil(subsectionForModal));
    }
  }, [subsectionForModal]);

  // Fetch org answers for just the active subsection.
  // -------------------------------------------------
  useEffect(() => {
    if (subsectionForModal) {
      requestAnswers({
        organization_id: organization.id,
        docbuilder_subsection_id: subsectionForModal.id,
      })
        .then((res) => {
          let resAnswers = get(res, "data.data", []);
          // Convert "value" properties to actual JSON objects.
          for (let i = 0; i < resAnswers.length; i++) {
            let v = resAnswers[i].value;
            resAnswers[i].value = isString(v) ? JSON.parse(v) : v;
          }
          let action = {
            type: "add",
            payload: resAnswers,
          };
          if (mounted.current) {
            dispatchAnswersReducer(action);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [subsectionForModal, organization]);

  // Set statuses for subsections when docbuilder changes.
  useEffect(() => {
    if (docbuilder) {
      let ss,
        payloadObj = {};

      // Subsections w/out questions first.
      // These are all n/a.
      ss = subsectionsWithoutQuestionsForDocbuilder(docbuilder, "ids");
      for (let i = 0; i < ss.length; i++) {
        payloadObj[ss[i]] = statuses.NOT_APPLICABLE;
      }

      // Subsections with questions.
      // Set all as PENDING here. They will be updated later
      // as answers are loaded/made.
      ss = subsectionsWithQuestionsForDocbuilder(docbuilder, "ids");
      for (let i = 0; i < ss.length; i++) {
        payloadObj[ss[i]] = statuses.PENDING;
      }

      if (mounted.current) {
        dispatchSubsectionStatusesReducer({
          type: "add",
          payload: payloadObj,
        });
      }
    }
  }, [docbuilder]);

  // Adjust subsection statuses when answers change.
  useEffect(() => {
    let answersArr = values(answers);
    let newStatuses = {};

    if (!docbuilder) {
      return;
    }

    // Skip if there are no answer changes.
    if (JSON.stringify(answers) === JSON.stringify(prevAnswers)) {
      return;
    }

    let questions = questionsForDocbuilder(docbuilder, "objects");

    // Store subsections that have been recalculated this time around
    // to avoid redundant processing if a subsection has multiple answers.
    let calculatedSubsectionIds = [];

    // Loop through all of the answers.
    for (let i = 0; i < answersArr.length; i++) {
      let a = answersArr[i];
      if (a && has(a, "value") && has(a, "docbuilder_question_id")) {
        let qId = a.docbuilder_question_id;

        // Get the question object so we can get the subsection.
        let q = find(questions, ["id", qId]);

        // If we haven't yet calculated the subsection for this question, do it here.
        if (q && !includes(calculatedSubsectionIds, q.docbuilder_subsection_id)) {
          let subsection = subsectionFromDocbuilder(docbuilder, q.docbuilder_subsection_id);
          if (subsection) {
            // Calculate the subsection status.
            let sp = new SubsectionProcessor(subsection, answersArr);
            newStatuses[subsection.id] = sp.calculateStatus();
            // Add to list of calculated subsectons.
            calculatedSubsectionIds.push(subsection.id);
          }
        }
      }
    }

    if (mounted.current) {
      dispatchSubsectionStatusesReducer({
        type: "add",
        payload: newStatuses,
      });
    }
  }, [docbuilder, answers, prevAnswers]);

  // Fetch org answers for entire active docbuilder
  // when org or docbuilder params change.
  // -----------------------------------------------
  useEffect(() => {
    if (!isNil(docbuilder) && !isNil(organization) && has(organization, "id")) {
      // Clear answer values since docbuilder or organization changed.
      if (mounted.current) {
        dispatchAnswersReducer({ type: "clear" });
      }

      // Fetch answers for active docbuilder from API and pass them to
      // our reducer via addOrUpdateAnswers().
      requestAnswers({
        organization_id: organization.id,
        docbuilder_id: docbuilder.id,
      })
        .then((res) => {
          let retrievedAnswers = get(res, "data.data", []);
          for (let i = 0; i < retrievedAnswers.length; i++) {
            let v = retrievedAnswers[i].value;
            retrievedAnswers[i].value = isString(v) ? JSON.parse(v) : v;
          }
          if (mounted.current) {
            addOrUpdateAnswers(retrievedAnswers);
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }, [addOrUpdateAnswers, docbuilder, organization]);

  // Set-up section numbering when docbuilder changes.
  useEffect(() => {
    if (!isNil(docbuilder)) {
      let newSectionNumbering = {};
      let currentNumber = 0;
      for (let i = 0; i < docbuilder.docbuilder_sections.length; i++) {
        let s = docbuilder.docbuilder_sections[i];
        if (sectionShouldBeNumberedInPreview(s, subsectionStatuses)) {
          newSectionNumbering[s.id] = ++currentNumber;
        }
      }
      if (mounted.current) {
        setSectionNumbering(newSectionNumbering);
      }
    }
  }, [docbuilder, subsectionStatuses]);

  // Reload section-scoped preview content as needed.
  //
  // This does technically support requesting for multiple sections,
  // but typically it'll only need to request one at a time. When needing
  // more than one section at a time, just reload the entire docbuilder
  // preview (but not via this effect).
  useEffect(() => {
    let canceledIndexes = []; // will store bools
    if (organization && outdatedSectionPreviews.length > 0) {
      for (let i = 0; i < outdatedSectionPreviews.length; i++) {
        canceledIndexes[i] = false;
        requestProcessedSection(outdatedSectionPreviews[i], organization.id, "preview")
          .then((res) => {
            if (undefined !== canceledIndexes[i] && !canceledIndexes[i]) {
              return;
            }
            // Add resulting data to previewContent.
            if (mounted.current) {
              dispatchPreviewContentReducer({
                type: "add",
                payload: res.data.content,
              });
            }
          })
          .catch((err) => {
            if (undefined !== canceledIndexes[i] && !canceledIndexes[i]) {
              return;
            }
            console.error("An error occurred loading a section preview. ", err);
          });
      }
      // Remove the sections we just processed from the outdated list.
      if (mounted.current) {
        dispatchOutdatedSectionPreviewsReducer({
          type: "remove",
          payload: outdatedSectionPreviews,
        });
      }
    }
    return () => {
      // https://stackoverflow.com/a/56443045/1191154
      for (let i = 0; i < canceledIndexes.length; i++) {
        canceledIndexes[i] = true;
      }
    };
  }, [organization, outdatedSectionPreviews]);

  // Update the combined stateKey var to reflect individual value changes.
  useEffect(() => {
    if (mounted.current) {
      setUicStateKey(`${uicStateKeyValue1}${uicStateKeyValue2}${uicStateKeyValue3}`);
    }
  }, [uicStateKeyValue1, uicStateKeyValue2, uicStateKeyValue3]);

  // Update content when dependents change.
  useEffect(() => {
    if (uic) {
      uic.contentForSlots(uicSlotKeys, uicStateKey).then((res) => {
        if (mounted.current) {
          setUicSlots(res);
        }
      });
    }
  }, [uic, uicStateKey]);

  // If user doesn't have access or we're still checking their access.
  if (!userCanViewDocbuilders || isNil(userCanEditDocbuilders)) {
    return (
      <Fragment>
        <PageNotFound />
      </Fragment>
    );
  } else if (loadingDocbuilder) {
    return (
      <Fragment>
        <CircularProgressGlobal />
      </Fragment>
    );
  } else if (isNil(docbuilder)) {
    // This scenario should only ever happen for a split second
    // on initial mounting of component.
    return null;
  }

  // If this docbuilder isn't available to the organization,
  // return a 404.
  if (false === docbuilderAvailableForOrgType) {
    return (
      <Fragment>
        <PageNotFound />
      </Fragment>
    );
  }

  return (
    <Fragment>
      {/*
      This CSS <link> is applicable wherever we're rendering doc content as either preview
      or final. The primary usage is to support formatting of a compiled doc; for example,
      applying highlighting in doc previews.
      */}
      <link
        rel="stylesheet"
        type="text/css"
        href={`${process.env.REACT_APP_API_URL}/api/v1/docbuilder-css`}
      />
      {"build" === format && (
        <Fragment>
          <Build
            organization={organization}
            docbuilder={docbuilder}
            docbuilderIsClosed={docbuilderIsClosed}
            previewPath={previewPath(organization.id, docbuilder.slug)}
            sectionNumbering={sectionNumbering}
            submittableStatus={submittableStatus}
            subsectionStatuses={subsectionStatuses}
            toggleDownloadModal={toggleDownloadModal}
            uic={uic}
            uicSlotClosedMessage={uicSlots.closed_message}
            uicSlotFinalLinkText={uicSlots.final_link_text}
            uicSlotPreviewLinkText={uicSlots.preview_link_text}
            uicSlotPrimaryViewAlertMessage={uicSlots.primary_view_alert_message}
            uicSlotPrimaryViewAlertSeverity={uicSlots.primary_view_alert_severity}
            uicStateKey={uicStateKey}
            userCanEditDocbuilders={userCanEditDocbuilders}
            userCanViewDocbuilders={userCanViewDocbuilders}
          />
          {uicSlots.build_page_footer.length > 0 && (
            <Box sx={{ margin: "0 auto", maxWidth: "680px", textAlign: "justify" }}>
              <Markup content={uicSlots.build_page_footer} />
            </Box>
          )}
        </Fragment>
      )}

      {"preview" === format && (
        <Preview
          organization={organization}
          docbuilder={docbuilder}
          docbuilderIsClosed={docbuilderIsClosed}
          buildPath={buildPath(organization.id, docbuilder.slug)}
          loadingFullPreview={loadingFullPreview}
          previewContent={previewContent}
          sectionNumbering={sectionNumbering}
          submittableStatus={submittableStatus}
          subsectionStatuses={subsectionStatuses}
          toggleDownloadModal={toggleDownloadModal}
          uic={uic}
          uicSlotClosedMessage={uicSlots.closed_message}
          uicSlotFinalLinkText={uicSlots.final_link_text}
          uicSlotPreviewBackLinkText={uicSlots.preview_back_link_text}
          uicSlotPreviewPrintLinkText={uicSlots.preview_print_link_text}
          uicSlotPrimaryViewAlertMessage={uicSlots.primary_view_alert_message}
          uicSlotPrimaryViewAlertSeverity={uicSlots.primary_view_alert_severity}
          uicStateKey={uicStateKey}
          userCanEditDocbuilders={userCanEditDocbuilders}
          userCanViewDocbuilders={userCanViewDocbuilders}
        />
      )}

      {/* Download modal */}
      <Modal
        open={finalModalOpen}
        onClose={(event, reason) => {
          toggleDownloadModal(false);
        }}
        closeAfterTransition={true}
        aria-labelledby="docbuilder-download-modal-header"
        sx={sxModal}
      >
        <Fade in={finalModalOpen}>
          <Paper sx={sxModalPaper} ref={finalModalContentContainerRef}>
            {/* Note that Modal requires a class-based component inside,
               not a function component. */}
            <ModalFinal
              closeWith={() => toggleDownloadModal(false)}
              closeAfterTransition={true}
              contentContainerModalRef={finalModalContentContainerRef}
              docbuilder={docbuilder}
              docbuilderIsClosed={docbuilderIsClosed}
              idForHeader="docbuilder-download-modal-header"
              idForSummary="docbuilder-download-summary"
              originSegment={originSegmentForFormat(format)}
              organization={organization}
              reloadPreviewFn={retrieveDocbuilderPreviewContent}
              reloadSubmittableMetaFn={fetchSubmittableMeta}
              requirementsMet={requirementsMet}
              submittableStatus={submittableStatus}
              uic={uic}
              uicSlotClosedMessage={uicSlots.closed_message}
              uicSlotFinalContentPrimary={uicSlots.final_content_primary}
              uicSlotFinalContentSecondary={uicSlots.final_content_secondary}
              uicSlotFinalContentSecondaryHeadline={uicSlots.final_content_secondary_headline}
              uicSlotFinalDownloadButtonText={uicSlots.final_download_button_text}
              uicSlotFinalSubmitButtonText={uicSlots.final_submit_button_text}
              uicSlotFinalViewHeadline={uicSlots.final_view_headline}
              uicSlotHelpLinkHref={uicSlots.help_link_href}
              uicSlotHelpLinkText={uicSlots.help_link_text}
              uicSlotSecondaryViewAlertMessage={uicSlots.secondary_view_alert_message}
              uicSlotSecondaryViewAlertSeverity={uicSlots.secondary_view_alert_severity}
              uicSlotUnsubmitButtonText={uicSlots.unsubmit_button_text}
              uicSlotUnsubmitConfirmationText={uicSlots.unsubmit_confirmation_text}
              uicSlotUnsubmitHelpText={uicSlots.unsubmit_help_text}
              uicStateKey={uicStateKey}
              userCanEditDocbuilders={userCanEditDocbuilders}
              userCanViewDocbuilders={userCanViewDocbuilders}
            />
          </Paper>
        </Fade>
      </Modal>

      {/* Subsection modal */}
      <Modal
        open={subsectionModalOpen}
        onClose={(event, reason) => {
          toggleSubsectionModal(false);
          subsectionModalOnClose(organization.id, docbuilder.slug, format, location, history);
        }}
        closeAfterTransition
        aria-labelledby="docbuilder-subsection-modal-header"
        aria-describedby="docbuilder-subsection-primary-text"
        sx={sxModal}
      >
        <Fade in={subsectionModalOpen}>
          <Paper sx={sxModalPaper} ref={subsectionModalContentContainerRef}>
            {/* Paper is applied here (rather than in Subsection)
            because Modal requires a class-based component inside. */}
            {subsectionForModal && (
              <Fragment>
                <ModalSubsection
                  answers={answers}
                  closeWith={() => {
                    toggleSubsectionModal(false);
                    subsectionModalOnClose(
                      organization.id,
                      docbuilder.slug,
                      format,
                      location,
                      history
                    );
                  }}
                  contentContainerModalRef={subsectionModalContentContainerRef}
                  docbuilder={docbuilder}
                  docbuilderIsClosed={docbuilderIsClosed}
                  docbuilderVars={docbuilderVars}
                  organizationId={organization.id}
                  readOnly={readOnly}
                  idForHeader="docbuilder-subsection-modal-header"
                  idForPrimaryText="docbuilder-subsection-primary-text"
                  deleteAnswer={deleteAnswer}
                  removeAnswerFromState={removeAnswerFromState}
                  submitAnswer={submitAnswer}
                  subsection={subsectionForModal}
                  subsectionStatus={
                    has(subsectionStatuses, subsectionForModal.id)
                      ? subsectionStatuses[subsectionForModal.id]
                      : SubsectionProcessor.defaultStatusForSubsection(subsectionForModal)
                  }
                  originSegment={originSegmentForFormat(format)}
                  addOrUpdateAnswers={addOrUpdateAnswers}
                  uic={uic}
                  uicSlotClosedMessage={uicSlots.closed_message}
                  uicSlotSecondaryViewAlertMessage={uicSlots.secondary_view_alert_message}
                  uicSlotSecondaryViewAlertSeverity={uicSlots.secondary_view_alert_severity}
                  uicStateKey={uicStateKey}
                  userCanEditDocbuilders={userCanEditDocbuilders}
                  userCanViewDocbuilders={userCanViewDocbuilders}
                />
              </Fragment>
            )}
          </Paper>
        </Fade>
      </Modal>
    </Fragment>
  );
}

// Array of the content slots we'll use.
const uicSlotKeys = [
  "build_page_footer",
  "closed_message",
  "final_download_button_text",
  "final_submit_button_text",
  "final_content_primary",
  "final_content_secondary",
  "final_content_secondary_headline",
  "final_link_text",
  "final_content_secondary_headline",
  "final_view_headline",
  "help_link_href",
  "help_link_text",
  "preview_back_link_text",
  "preview_link_text",
  "preview_print_link_text",
  "primary_view_alert_message",
  "primary_view_alert_severity",
  "secondary_view_alert_message",
  "secondary_view_alert_severity",
  "unsubmit_button_text",
  "unsubmit_confirmation_text",
  "unsubmit_help_text",
];

// Initial value for uicSlots state var.
//
// Returns an object keyed by the values of uicSlotKeys. Each
// value is an empty string.
const uicSlotsInitValue = () => {
  return uicSlotKeys.reduce((prev, cur) => {
    prev[cur] = "";
    return prev;
  }, {});
};

// Call when user closes modal or to close modal.
//
// Removes subsection slug from current URL path (presence/absence of the
//   subsection slug determines modal state).
const subsectionModalOnClose = (orgId, slug, format, location, history) => {
  let newPath = pathForFormat(orgId, slug, format);
  // Only push if the new path would be different from the existing path.
  if (location.pathname !== newPath) {
    history.push(newPath);
  }
};

// Get "preview" path for an org and docbuilder.
const previewPath = (orgId, slug) => {
  return pathForFormat(orgId, slug, "preview");
};

// Get "build" path for an org and docbuilder.
const buildPath = (orgId, slug) => {
  return pathForFormat(orgId, slug, "build");
};

// Get path for an org and docbuilder in a given format.
const pathForFormat = (orgId, slug, format) => {
  try {
    let origin = originSegmentForFormat(format);
    return `/app/account/organizations/${orgId}/builder/${slug}/${origin}`;
  } catch (e) {
    console.error(e.message);
  }
  return "";
};

// Get the origin segment for a format.
const originSegmentForFormat = (format) => {
  switch (format) {
    case "build":
      return "build";
    case "preview":
      return "preview";
    default:
      throw new Error("Invalid format received by originSegmentForFormat()");
  }
};

/**
 * Reducer for `answers`.
 *
 * @param {object} answers
 *  This is the `answers` state var declared with useReducer(). It's an
 *  object that contains answer objects keyed by their question ID.
 *
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should be an array of answer objects.
 *  - When `type` is "remove", `payload` should be an array of _question_ IDs.
 *  - When `type` is "clear", `payload` isn't used.
 *
 * @returns {object} Returns updated copy of `answers` object.
 */
const answersReducer = (answers, action) => {
  let target = { ...answers };

  switch (action.type) {
    // Note: action.payload for action.type "add" should be an array of
    // answer objects.
    case "add":
      for (let i = 0; i < action.payload.length; i++) {
        let a = action.payload[i];
        target[a.docbuilder_question_id] = a;
      }
      break;
    // Note: action.payload for action.type "remove" should be an array
    //  of _question_ IDs (not answer IDs).
    // Note2: Probably not going to be manually removing answers from here
    //  very often.
    case "remove":
      for (let i = 0; i < action.payload.length; i++) {
        delete target[action.payload[i]];
      }
      break;
    // Payload is ignored for "clear".
    case "clear":
      target = {};
      break;
    default:
      break;
  }
  return target;
};

/**
 * Reducer for `previewContent`.
 *
 * @param {object} previewContent
 *  This is the `previewContent` component var declared with useReducer().
 *
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should contain an array of subsection
 *    objects that include a `_render` property containing an HTML string.
 *  - When `type` is "remove", `payload` should contain an array of subsection IDs.
 *  - When `type` is "clear", `payload` isn't used.
 *
 * @returns {object}
 */
const previewContentReducer = (previewContent, action) => {
  let target = { ...previewContent };
  switch (action.type) {
    case "add":
      for (let i = 0; i < action.payload.length; i++) {
        let subsection = action.payload[i];
        // If item is a string, it means it was a section header, not a subsection object. We
        // handle section headers for previews entirely in the FE, so we can just skip it.
        if (subsection && !isString(subsection)) {
          target[subsection.id] = subsection;
        }
      }
      break;
    case "remove":
      for (let i = 0; i < action.payload.length; i++) {
        delete target[action.payload[i]];
      }
      break;
    case "clear":
      target = {};
      break;
    default:
      break;
  }
  return target;
};

/**
 * Reducer for `outdatedSectionPreviews`.
 *
 * @param {array} outdatedSectionPreviews
 *  This is the `outdatedSectionPreviews` component var declared with
 *  userReducer().
 *
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should contain an array of section IDs.
 *  - When `type` is "remove" `payload` should contain an array of section IDs.
 *  - When `type` is "clear", `payload` isn't used.
 *
 * @returns {array}
 */
const outdatedSectionPreviewsReducer = (outdatedSectionPreviews, action) => {
  let target = [...outdatedSectionPreviews];
  switch (action.type) {
    case "add":
      for (let i = 0; i < action.payload.length; i++) {
        // Add the sections that aren't already there.
        if (!includes(outdatedSectionPreviews, action.payload[i])) {
          target.push(action.payload[i]);
        }
      }
      break;
    case "remove":
      target = difference(target, action.payload);
      break;
    case "clear":
      target = [];
      break;
    default:
      break;
  }
  return target;
};

/**
 * Reducer for `subsectionStatuses`.
 *
 * @param {object} subsectionStatuses
 *  Object with subsection statuses (ints) keyed by subsection ID. This is the
 *  `subsectionStatuses` component var declared with userReducer().
 *
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should contain an object where properties
 *    are named by subsection ID with a value of the corresponding status.
 *  - When `type` is "remove", `payload` should be an array of subsection IDs.
 *  - When `type` is "clear", no payload is needed.
 *
 * @returns {object}
 */
const subsectionStatusesReducer = (subsectionStatuses, action) => {
  let target = { ...subsectionStatuses };

  switch (action.type) {
    case "add":
      forOwn(action.payload, (value, key) => {
        target[key] = value;
      });
      break;
    case "remove":
      for (let i = 0; i < action.payload.length; i++) {
        if (subsectionStatuses.hasOwnProperty(action.payload[i])) {
          delete target[action.payload[i]];
        }
      }
      break;
    case "clear":
      target = {};
      break;
    default:
      break;
  }

  return target;
};

const sxModal = {
  margin: "2px auto",
  maxWidth: "900px",
};

const sxModalPaper = {
  overflowY: "scroll",
  maxHeight: "100vh",
};

Docbuilder.propTypes = {
  docbuilderSlug: PropTypes.string.isRequired,
  format: PropTypes.oneOf(["build", "preview"]).isRequired,
  organization: PropTypes.shape(organizationShape).isRequired,
  subsectionId: PropTypes.number, // for subsection modal
};
