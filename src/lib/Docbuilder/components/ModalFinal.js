import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import memoizee from "memoizee";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import PropTypes from "prop-types";
import { has, keyBy, values } from "lodash";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import { organizationShape } from "constants/propTypeShapes";
import { docbuilderWithSectionsShape } from "../prop-type-shapes";
import subsectionsForDocbuilder from "../utils/subsection/subsectionsForDocbuilder";
import { requestProcessedDocbuilder } from "../requests";
import ModalHeader from "./ModalParts/ModalHeader";
import ModalHeaderCloseButton from "./ModalParts/ModalHeader/CloseButton";
import ModalHeaderPreviewButton from "./ModalParts/ModalHeader/PreviewButton";
import ModalHeaderColumn from "./ModalParts/ModalHeader/Column";
import ModalHeaderDivider from "./ModalParts/ModalHeader/Divider";
import ModalContent from "./ModalParts/ModalContent";
import ModalContentPrimaryWrapper from "./ModalParts/ModalContent/PrimaryWrapper";
import ModalContentSecondaryWrapper from "./ModalParts/ModalContent/SecondaryWrapper";
import ModalContentSecondaryBlock from "./ModalParts/ModalContent/SecondaryBlock";
import FinalActionSubmitButton from "./Other/FinalActionSubmitButton";
import FinalActionDownloadButton from "./Other/FinalActionDownloadButton";
import UnsubmitButton from "./Other/UnsubmitButton";
import ViewAlert from "./Other/ViewAlert";
import HgButtonWithIconAndText from "components/ui/HgButtonWithIconAndText";
import HgSkeleton from "components/ui/HgSkeleton";
import scrollWithOffset from "utils/scrollWithOffset";
import hgToast from "utils/hgToast";
import { Markup } from "interweave";
import Submittable from "../classes/MetaHandlers/Submittable";
import styleVars from "style/_vars.scss";

//
// Final view for a docbuilder.
// ----------------------------
// Typically rendered as a modal display launched from a docbuilder
// build or preview display.
//

export default function ModalFinal({
  uicSlotClosedMessage,
  uicSlotFinalDownloadButtonText,
  uicSlotFinalSubmitButtonText,
  uicSlotFinalContentPrimary,
  uicSlotFinalContentSecondary,
  uicSlotFinalContentSecondaryHeadline,
  uicSlotFinalViewHeadline,
  uicSlotHelpLinkHref,
  uicSlotHelpLinkText,
  uicSlotSecondaryViewAlertMessage,
  uicSlotSecondaryViewAlertSeverity,
  uicSlotUnsubmitButtonText,
  uicSlotUnsubmitConfirmationText,
  uicSlotUnsubmitHelpText,
  closeWith,
  contentContainerModalRef,
  docbuilder,
  docbuilderIsClosed,
  idForHeader,
  organization,
  reloadPreviewFn,
  reloadSubmittableMetaFn,
  requirementsMet,
  submittableStatus,
  uic,
  uicStateKey,
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

  const currentUser = useSelector((state) => state.auth.currentUser);
  const classes = useStyles();
  const theme = useTheme();
  const smallDisplay = useMediaQuery(theme.breakpoints.down("lg"));
  const [docSectionsWithProblems, setDocSectionsWithProblems] = useState([]);
  const [docStatus, setDocStatus] = useState(docStatuses.CALCULATING);
  const [finalActionDownloadButtonDisabled, setFinalActionDownloadButtonDisabled] = useState(true);
  const [finalActionSubmitButtonDisabled, setFinalActionSubmitButtonDisabled] = useState(true);
  const [showSubmittableActions, setShowSubmittableActions] = useState(false);
  const [showUnsubmitButton, setShowUnsubmitButton] = useState(false);

  // Check and set docStatus, problems when core props change.
  // These values determine whether the user will be allowed to
  // execute the final action or not (downloading a Word file,
  // submitting, etc).
  useEffect(() => {
    if (mounted.current) {
      setDocStatus(docStatuses.CALCULATING);
    }

    requestProcessedDocbuilder(docbuilder.id, organization.id, "final")
      .then((res) => {
        if (200 === res.status) {
          // If any problems were reported, we cannot proceed.
          let foundProblems = res.data.problems.length > 0;
          let newStatus = foundProblems ? docStatuses.INVALID : docStatuses.VALID;

          // Prepare problems to report. Note res.data.problems.length is
          // the _actual_ number of problems. The array we get back from
          // calculateSectionsWithProblems() consolidates problems into one
          // per section, and it's currently possible that the API is incorrectly
          // attributing problems, so it's even possible that probSections is
          // empty when there actually are problems.
          let probSections = [];
          if (foundProblems) {
            probSections = calculateSectionsWithProblems(docbuilder, res.data.problems);
          }

          if (mounted.current) {
            setDocStatus(newStatus);
            setDocSectionsWithProblems(probSections);
          }
        }
        // If we're here in the success callback but the result wasn't
        // a 200 status, something unexpected happened.
        else {
          if (mounted.current) {
            setDocStatus(docStatuses.INVALID);
            setDocSectionsWithProblems([]);
            console.warn("Unexpected result in retrieveDocbuilderPreviewContent.", res);
          }
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setDocStatus(docStatuses.INVALID);
          setDocSectionsWithProblems([]);
          console.error('An error occurred in retrieving "final" docbuilder content.', err);
        }
      });
  }, [docbuilder, organization, userCanViewDocbuilders]);

  // Enable/disable final action download button.
  useEffect(() => {
    let newFinalActionDownloadButtonDisabled = true;
    if (docStatuses.VALID === docStatus && userCanViewDocbuilders) {
      newFinalActionDownloadButtonDisabled = false;
    }
    setFinalActionDownloadButtonDisabled(newFinalActionDownloadButtonDisabled);
  }, [docStatus, userCanViewDocbuilders]);

  // Control access/status of un/submit buttons for submittable docbuilders.
  useEffect(() => {
    let newFinalActionSubmitButtonDisabled = true;
    let newShowSubmittableActions = false;
    let newShowUnsubmitButton = false;

    // Conditions below only applicable for submittable docbuilders.
    if (Submittable.isSubmittable(docbuilder)) {
      // If docbuilder is submittable, we show the actions area.
      newShowSubmittableActions = true;

      // Whether a user can do anything depends on if they have permission
      // and whether the docbuilder is open.
      if (userCanEditDocbuilders && !docbuilderIsClosed) {
        // If pending, or locked but current user is admin, unsubmit button is shown.
        if (
          submittableStatus === Submittable.submittableStatuses.SUBMITTED_AND_PENDING ||
          (currentUser.isAdmin &&
            submittableStatus === Submittable.submittableStatuses.SUBMITTED_AND_LOCKED)
        ) {
          newShowUnsubmitButton = true;
        }
        // Only enable the submit button for statuses where it makes sense.
        if (
          requirementsMet &&
          submittableStatus !== Submittable.submittableStatuses.SUBMITTED_AND_PENDING &&
          submittableStatus !== Submittable.submittableStatuses.SUBMITTED_AND_LOCKED
        ) {
          newFinalActionSubmitButtonDisabled = false;
        }
      }
    }

    setFinalActionSubmitButtonDisabled(newFinalActionSubmitButtonDisabled);
    setShowSubmittableActions(newShowSubmittableActions);
    setShowUnsubmitButton(newShowUnsubmitButton);
  }, [
    currentUser,
    docbuilder,
    docbuilderIsClosed,
    docStatus,
    requirementsMet,
    submittableStatus,
    userCanEditDocbuilders,
  ]);

  // Primary content output when docbuilder validity is still being calculated.
  const renderPrimarySkeleton = () => {
    return (
      <React.Fragment>
        <HgSkeleton variant="text" width="100%" />
        <HgSkeleton variant="text" width="100%" />
        <br />
        <HgSkeleton variant="text" width="60%" />
      </React.Fragment>
    );
  };

  // Output for list of problems.
  const renderProblems = (docbuilder, organization, problematicSections = []) => {
    return (
      <Fragment>
        {problematicSections && problematicSections.length > 0 && (
          <Fragment>
            <p style={{ margin: "1em 0" }}>
              The sections below appear to be missing required information:
            </p>
            <ul>
              {problematicSections.map((probSection) => (
                <li key={probSection.id}>
                  <HashLink
                    smooth
                    onClick={closeWith}
                    scroll={(el) => scrollWithOffset(el)}
                    to={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/build#${probSection.slug}-${probSection.id}`}
                  >
                    {probSection.builder_headline}
                  </HashLink>
                </li>
              ))}
            </ul>
          </Fragment>
        )}
      </Fragment>
    );
  };

  const onSubmitFailure = useCallback((errorMessage) => {
    hgToast("An error occurred during submission");
    console.error(`Docbuilder submission error: ${errorMessage}`);
  }, []);

  const onSubmitSuccess = useCallback(
    (submittableDataObj) => {
      hgToast("Submitted!");
      reloadSubmittableMetaFn(docbuilder, organization);
      reloadPreviewFn();
    },
    [docbuilder, organization, reloadPreviewFn, reloadSubmittableMetaFn]
  );

  const onUnsubmitFailure = useCallback((errorMessage) => {
    hgToast("An error occurred during unsubmission");
    console.error(`Docbuilder unsubmission error: ${errorMessage}`);
  }, []);

  const onUnsubmitSuccess = useCallback(() => {
    hgToast("Submission has been undone");
    reloadSubmittableMetaFn(docbuilder, organization);
  }, [docbuilder, organization, reloadSubmittableMetaFn]);

  // Return nothing if the user doesn't have permission.
  if (!userCanViewDocbuilders) {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      {/* === HEADER === */}
      <ModalHeader idForHeader={idForHeader}>
        <ModalHeaderColumn
          style={{
            flexGrow: 1,
          }}
        >
          <div className={classes.headerHeadlinesWrapper}>
            <div className={classes.docbuilderHeadline}>{docbuilder.name}</div>
            <div className={classes.modalHeadline}>
              {uicSlotFinalViewHeadline && <Fragment>{uicSlotFinalViewHeadline}</Fragment>}
            </div>
          </div>
        </ModalHeaderColumn>

        {smallDisplay ? (
          <React.Fragment>
            {/* SMALL DISPLAY */}
            <ModalHeaderColumn>
              <ModalHeaderCloseButton closeWith={closeWith} hideText={true} />
            </ModalHeaderColumn>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* BIGGER THAN SMALL DISPLAY */}
            <ModalHeaderColumn>
              <ModalHeaderPreviewButton
                closeWith={closeWith}
                docbuilderSlug={docbuilder.slug}
                organizationId={organization.id}
              />
            </ModalHeaderColumn>
            <ModalHeaderDivider />
            <ModalHeaderColumn>
              <ModalHeaderCloseButton closeWith={closeWith} />
            </ModalHeaderColumn>
          </React.Fragment>
        )}
      </ModalHeader>

      {/* === CONTENT === */}
      <ModalContent>
        {/* == PRIMARY CONTENT OUTPUT == */}
        <ModalContentPrimaryWrapper>
          {docbuilderIsClosed && uicSlotClosedMessage && uicSlotClosedMessage.length > 0 && (
            <ViewAlert
              small={false}
              marginBottom={"1em"}
              marginTop={"0"}
              message={uicSlotClosedMessage}
              severity="info"
            ></ViewAlert>
          )}

          <ViewAlert
            small={true}
            marginBottom={"1em"}
            marginTop={"0"}
            message={uicSlotSecondaryViewAlertMessage}
            severity={uicSlotSecondaryViewAlertSeverity}
          ></ViewAlert>

          {docStatus && (
            <Fragment>
              {docStatus === docStatuses.CALCULATING ? (
                <Fragment>
                  {/* === CALCULATING === */}
                  {renderPrimarySkeleton()}
                </Fragment>
              ) : (
                <Fragment>
                  {/* === NOT CALCULATING === */}
                  {uicSlotFinalContentPrimary && (
                    <Fragment>
                      {/* - Primary content - */}
                      <Markup content={uicSlotFinalContentPrimary} />
                    </Fragment>
                  )}
                  {docStatus === docStatuses.INVALID && (
                    <Fragment>
                      {/* - Problems list - */}
                      {renderProblems(docbuilder, organization, docSectionsWithProblems)}
                      <div className={classes.previewLinkWrapper}>
                        {renderPreviewLink(
                          docbuilder.slug,
                          organization.id,
                          closeWith,
                          <Markup
                            content={`<div style="text-align:right"><em>View preview &raquo;</em></div>`}
                          />
                        )}
                      </div>
                    </Fragment>
                  )}

                  <br />

                  {/*
                  SUBMIT AND UNSUBMIT BUTTONS: Submittable docbuilders only
                  */}
                  {showSubmittableActions && (
                    <div className={classes.submittableActionsWrapper}>
                      {/* SUBMIT BUTTON*/}
                      <div className={classes.finalActionSubmitButtonWrapper}>
                        <FinalActionSubmitButton
                          buttonText={uicSlotFinalSubmitButtonText}
                          docbuilderSlug={docbuilder.slug}
                          disabled={finalActionSubmitButtonDisabled}
                          onFailureFn={onSubmitFailure}
                          onSuccessFn={onSubmitSuccess}
                          organizationId={organization.id}
                          size={"medium"}
                        />
                      </div>
                      {/* UNSUBMIT BUTTON*/}
                      {showUnsubmitButton && (
                        <div className={classes.unsubmitButtonWrapper}>
                          <UnsubmitButton
                            buttonText={uicSlotUnsubmitButtonText}
                            confirmationText={uicSlotUnsubmitConfirmationText}
                            docbuilderSlug={docbuilder.slug}
                            onFailureFn={onUnsubmitFailure}
                            onSuccessFn={onUnsubmitSuccess}
                            organizationId={organization.id}
                            size={"small"}
                          />
                          {uicSlotUnsubmitHelpText.length > 0 && (
                            <div>
                              <small>
                                <em>{uicSlotUnsubmitHelpText}</em>
                              </small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DOWNLOAD BUTTON */}
                  <div className={classes.finalActionDownloadButtonWrapper}>
                    <FinalActionDownloadButton
                      buttonText={uicSlotFinalDownloadButtonText}
                      docbuilderSlug={docbuilder.slug}
                      disabled={finalActionDownloadButtonDisabled}
                      organizationId={organization.id}
                      size={docbuilder.submittable ? "small" : "medium"}
                    />
                  </div>

                  {/* VIEW AS HTML BUTTON */}
                  <div style={{ margin: "1em 0" }}>
                    {renderViewHtmlButton(docbuilder.slug, organization.id, docStatus, currentUser)}
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}
        </ModalContentPrimaryWrapper>

        {/* == SECONDARY CONTENT OUTPUT == */}
        <ModalContentSecondaryWrapper>
          <ModalContentSecondaryBlock title={uicSlotFinalContentSecondaryHeadline}>
            {uicSlotFinalContentSecondary && (
              <Fragment>
                <Markup content={uicSlotFinalContentSecondary} />
              </Fragment>
            )}
            {uicSlotHelpLinkHref && uicSlotHelpLinkText && (
              <HgButtonWithIconAndText
                icon={ContactSupportOutlinedIcon}
                buttonProps={{
                  "aria-label": uicSlotHelpLinkText,
                  component: "a",
                  href: uicSlotHelpLinkHref,
                  target: "_blank",
                }}
              >
                {uicSlotHelpLinkText}
              </HgButtonWithIconAndText>
            )}
          </ModalContentSecondaryBlock>
        </ModalContentSecondaryWrapper>
      </ModalContent>
    </div>
  );
}

// Define doc statuses specific to this component.
const docStatuses = Object.freeze({
  CALCULATING: 100,
  INVALID: 110,
  VALID: 120,
});

// Returns JSX for the view as HTML button (for admins, testing only)
const renderViewHtmlButton = memoizee((docSlug, orgId, status, currentUser) => {
  if (!currentUser || !currentUser.isAdmin) {
    return null;
  }

  let apiBaseUrl = process.env.REACT_APP_API_URL;
  let dest = `${apiBaseUrl}/api/v1/docbuilders/${docSlug}/organizations/${orgId}/doc/html`;
  let disabled = status === docStatuses.VALID ? false : true;

  return (
    <Fragment>
      <Button
        size="small"
        component="a"
        href={dest}
        color="primary"
        variant="contained"
        disabled={disabled}
        target="_blank"
      >
        View as HTML
      </Button>
      <div>
        <small>
          <em>HTML option only visible to admin users.</em>
        </small>
      </div>
    </Fragment>
  );
});

const renderPreviewLink = memoizee((docSlug, orgId, closeWith, content = "Preview") => {
  return (
    <Link to={previewPath(docSlug, orgId)} onClick={closeWith}>
      {content}
    </Link>
  );
});

const previewPath = (docSlug, orgId) => {
  return `/app/account/organizations/${orgId}/builder/${docSlug}/preview`;
};

/**
 * @param {object} docbuilder
 *   Docbuilder with sections, subsections hydrated.
 * @param {array} problems
 *   Problems array returned from API.
 * @returns {array} Array of section objects
 */
const calculateSectionsWithProblems = memoizee((_docbuilder, _problems) => {
  // Extract sections, subsections to keyed objects.
  let subsById = keyBy(subsectionsForDocbuilder(_docbuilder, "objects"), "id");
  let sectionsById = keyBy(_docbuilder.docbuilder_sections, "id");

  /**
   * Find the section for a subsection ID.
   * @param {int} subId A subsection ID.
   * @returns {object|mull} The section object or null if none.
   */
  function _sectionForSubId(subId) {
    if (subId && has(subsById, subId)) {
      let sub = subsById[subId];
      if (has(sectionsById, sub.docbuilder_section_id)) {
        return sectionsById[sub.docbuilder_section_id];
      }
    }
    return null;
  }

  // We'll store sections that have problems or contain problematic children in this
  // object, keyed by ID.
  let probSections = {};

  // In case we there's an incorrect or missing sub ID, we'll stash problems we
  // can't find a match for here. This was added while debugging an earlier issue,
  // but we'll leave it since it may help future debugging.
  let mysteryProblems = [];

  // Loop thru problems to populate res.
  for (let i = 0; i < _problems.length; i++) {
    if (has(_problems[i], "subsectionId")) {
      let probSubId = _problems[i].subsectionId;
      let probSection = _sectionForSubId(probSubId);
      if (probSection) {
        probSections[probSection.id] = probSection;
        continue;
      }
    }
    // If here, the problem record wasn't valid.
    mysteryProblems.push(_problems[i]);
  }

  // Report any mysteryProblems in the console.
  if (mysteryProblems.length > 0) {
    console.error(
      "The following problems are not associated with known entities:",
      mysteryProblems
    );
  }

  // Return the unique sections we found with problems.
  return values(probSections);
});

const useStyles = makeStyles((theme) => ({
  wrapper: {
    paddingBottom: theme.spacing(2),
  },
  headerHeadlinesWrapper: {
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
  },
  docbuilderHeadline: {
    color: styleVars.txtColorDefault,
    fontSize: styleVars.txtFontSizeXs,
    letterSpacing: "0.05em",
    marginBottom: theme.spacing(0.25),
    textTransform: "uppercase",
  },
  modalHeadline: {
    color: styleVars.txtColorDefault,
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  submittableActionsWrapper: {
    // only shown if docbuilder.submittable
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    margin: "1em 0 1.5em",
    paddingBottom: "1.5em",
  },
  finalActionSubmitButtonWrapper: {
    // only shown if docbuilder.submittable
    margin: "1em 0 1.5em",
  },
  UnsubmitButtonWrapper: {
    //
  },
  finalActionDownloadButtonWrapper: {
    // always shown
    margin: "1em 0",
  },
}));

ModalFinal.propTypes = {
  closeWith: PropTypes.func.isRequired,
  contentContainerModalRef: PropTypes.object,
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  docbuilderIsClosed: PropTypes.bool,
  idForHeader: PropTypes.string.isRequired,
  organization: PropTypes.shape(organizationShape).isRequired,
  reloadPreviewFn: PropTypes.func.isRequired,
  reloadSubmittableMetaFn: PropTypes.func.isRequired,
  requirementsMet: PropTypes.bool,
  submittableStatus: PropTypes.number,
  uic: PropTypes.object,
  uicSlotClosedMessage: PropTypes.string,
  uicSlotFinalDownloadButtonText: PropTypes.string,
  uicSlotFinalSubmitButtonText: PropTypes.string,
  uicSlotFinalContentPrimary: PropTypes.string,
  uicSlotFinalContentSecondary: PropTypes.string,
  uicSlotFinalContentSecondaryHeadline: PropTypes.string,
  uicSlotFinalViewHeadline: PropTypes.string,
  uicSlotHelpLinkHref: PropTypes.string,
  uicSlotHelpLinkText: PropTypes.string,
  uicSlotSecondaryViewAlertMessage: PropTypes.string,
  uicSlotSecondaryViewAlertSeverity: PropTypes.string,
  uicSlotUnsubmitButtonText: PropTypes.string,
  uicSlotUnsubmitConfirmationText: PropTypes.string,
  uicSlotUnsubmitHelpText: PropTypes.string.isRequired,
  uicStateKey: PropTypes.string.isRequired,
  userCanEditDocbuilders: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
};
