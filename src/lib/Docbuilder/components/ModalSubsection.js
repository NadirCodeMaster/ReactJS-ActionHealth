import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { debounce, get, includes, isNil } from "lodash";
import { useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Question from "./Other/Question";
import {
  docbuilderAnswerCommonShape,
  docbuilderSubsectionShape,
  docbuilderWithSectionsShape,
  docbuilderVarsShape,
} from "../prop-type-shapes";
import { errorInUnsavedAnswersMessage, statuses } from "../utils/subsection/constants";
import SubsectionStatusIndicator from "./Other/SubsectionStatusIndicator";
import ViewAlert from "./Other/ViewAlert";
import sectionFromDocbuilder from "../utils/section/sectionFromDocbuilder";
import adjacentSubsection from "../utils/subsection/adjacentSubsection";
import ModalHeader from "./ModalParts/ModalHeader";
import ModalHeaderCloseButton from "./ModalParts/ModalHeader/CloseButton";
import ModalHeaderPreviewButton from "./ModalParts/ModalHeader/PreviewButton";
import ModalHeaderColumn from "./ModalParts/ModalHeader/Column";
import ModalHeaderDivider from "./ModalParts/ModalHeader/Divider";
import ModalContent from "./ModalParts/ModalContent";
import ModalContentPrimaryWrapper from "./ModalParts/ModalContent/PrimaryWrapper";
import ModalContentSecondaryWrapper from "./ModalParts/ModalContent/SecondaryWrapper";
import ModalContentSecondaryBlock from "./ModalParts/ModalContent/SecondaryBlock";
import ModalContentTertiaryWrapper from "./ModalParts/ModalContent/TertiaryWrapper";
// import Handlebars from 'handlebars';
import Handlebars from "handlebars/dist/handlebars";
import HgButtonWithIconAndText from "components/ui/HgButtonWithIconAndText";
import HgSkeleton from "components/ui/HgSkeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Markup } from "interweave";
import styleVars from "style/_vars.scss";

//
// Question interface for a docbuilder subsection.
// -----------------------------------------------
// Typically rendered as a modal display launched from a docbuilder
// detail or preview display.
//

export default function ModalSubsection({
  addOrUpdateAnswers,
  answers,
  closeWith,
  docbuilder,
  docbuilderIsClosed,
  docbuilderVars,
  docbuilderVarsLoading,
  idForHeader,
  contentContainerModalRef,
  readOnly,
  deleteAnswer,
  submitAnswer,
  subsection,
  subsectionStatus,
  organizationId,
  originSegment,
  uic,
  uicSlotClosedMessage,
  uicSlotSecondaryViewAlertMessage,
  uicSlotSecondaryViewAlertSeverity,
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

  const classes = useStyles();
  const theme = useTheme();
  const smallDisplay = useMediaQuery(theme.breakpoints.down("md"));
  const [section, setSection] = useState(null);
  const [prevSubsectionId, setPrevSubsectionId] = useState(null);
  const [nextSubsectionId, setNextSubsectionId] = useState(null);

  const [processedBuilderPrimaryText, setProcessedBuilderPrimaryText] = useState("");
  const [processedBuilderSecondaryText, setProcessedBuilderSecondaryText] = useState("");

  // This should be true when a displayed (not stored) answer has a
  // validation error **and** the subsectionStatus (which represents the status
  // of stored answers) would otherwise indicate everything is ok.
  // Do not set this to true when the stored answer is already known to
  // be incomplete/invalid.
  const [errorInUnsavedAnswers, setErrorInUnsavedAnswers] = useState(false);

  // This object stores the status of displayed answers (not stored answers).
  // Keys are question IDs, values are bool representing valid (true) or not.
  const [displayedAnswerStatuses, setDisplayedAnswerStatuses] = useState({});

  // Set processed builder texts, replacing vars w/handlebars.
  useEffect(() => {
    if (subsection) {
      let pText = get(subsection, "builder_primary_text", "");
      let sText = get(subsection, "builder_secondary_text", "");
      if (docbuilderVars) {
        let pTpl = Handlebars.compile(pText);
        pText = pTpl(docbuilderVars);
        let sTpl = Handlebars.compile(sText);
        sText = sTpl(docbuilderVars);
      }
      if (mounted.current) {
        setProcessedBuilderPrimaryText(pText);
        setProcessedBuilderSecondaryText(sText);
      }
    }
  }, [docbuilderVars, subsection]);

  // Set section state var.
  useEffect(() => {
    // Find the section that subsection belongs to inside docbuilder.
    let newSection = null;
    if (!isNil(subsection) && !isNil(docbuilder)) {
      newSection = sectionFromDocbuilder(docbuilder, subsection.docbuilder_section_id);
    }
    if (mounted.current) {
      setSection(newSection);
    }
  }, [docbuilder, subsection]);

  // Populate prev/next subsection IDs.
  useEffect(() => {
    let prev = adjacentSubsection(docbuilder, subsection.id, "prev", "builder");
    let next = adjacentSubsection(docbuilder, subsection.id, "next", "builder");
    if (mounted.current) {
      setPrevSubsectionId(prev);
      setNextSubsectionId(next);
    }
  }, [docbuilder, subsection]);

  // Reset displayedAnswerStatuses, errorInUnsavedAnswers
  // when subsection changes.
  useEffect(() => {
    if (mounted.current) {
      setDisplayedAnswerStatuses({});
      setErrorInUnsavedAnswers(false);
    }
  }, [subsection]);

  // Controls stats flags at the question level.
  const applyDisplayedAnswerStatus = useCallback((qId, status) => {
    if (mounted.current) {
      setDisplayedAnswerStatuses((prev) => {
        return { ...prev, [qId]: status };
      });
    }
  }, []);

  // Debounced proxy for calculateErrorInUnsavedAnswers that also
  // sets the corresponding state var as needed.
  //
  // NOTE: The eslint line disable is to prevent warning about "useCallback
  //       received a function whose dependencies are unknown" that comes
  //       from using debounce().
  //
  // eslint-disable-next-line
  const calculateAndApplyErrorInUnsavedAnswers = useCallback(
    debounce((sub, subStatus, displayedAnswerStatuses) => {
      let res = calculateErrorInUnsavedAnswers(sub, subStatus, displayedAnswerStatuses);
      if (mounted.current) {
        setErrorInUnsavedAnswers(res);
      }
      // Keep the debounce rate below high to avoid the subsection status
      // indicator from briefly flashing an error icon due to the calculation
      // being executed with an empty value because the state hasn't had
      // enough time to update and re-trigger.
    }, 600),
    []
  );

  // Update errorInUnsavedAnswers when needed.
  useEffect(() => {
    calculateAndApplyErrorInUnsavedAnswers(subsection, subsectionStatus, displayedAnswerStatuses);
  }, [
    calculateAndApplyErrorInUnsavedAnswers,
    subsection,
    displayedAnswerStatuses,
    subsectionStatus,
  ]);

  // Return nothing if the user doesn't have permission or if the section
  // var isn't populated yet. Having the section var populated first just
  // improves the rendering.
  if (!userCanViewDocbuilders || isNil(section)) {
    return null;
  }

  if (!docbuilderVars) {
    return (
      <div style={{ padding: styleVars.paperPadding }}>
        <HgSkeleton variant="text" width="60%" />
        <HgSkeleton variant="text" width="60%" />
        <HgSkeleton variant="text" width="60%" />
        <HgSkeleton variant="text" width="40%" />
      </div>
    );
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
            {section && section.builder_headline.trim().length > 0 && (
              <div className={classes.sectionHeadline}>
                <Markup content={section.builder_headline} />
              </div>
            )}
            {subsection && subsection.builder_headline.trim().length > 0 && (
              <div className={classes.subsectionHeadline}>
                <Markup content={subsection.builder_headline} />
              </div>
            )}
          </div>
        </ModalHeaderColumn>

        <ModalHeaderColumn>
          <SubsectionStatusIndicator
            errorPresent={errorInUnsavedAnswers}
            errorText={errorInUnsavedAnswersMessage}
            status={subsectionStatus}
            fontSize="28px"
          />
        </ModalHeaderColumn>

        <ModalHeaderDivider />

        {smallDisplay ? (
          <Fragment>
            {/* SMALL DISPLAY */}
            <ModalHeaderColumn>
              <ModalHeaderCloseButton closeWith={closeWith} hideText={true} />
            </ModalHeaderColumn>
          </Fragment>
        ) : (
          <Fragment>
            {/* BIGGER THAN SMALL DISPLAY */}
            <ModalHeaderColumn>
              <ModalHeaderPreviewButton
                closeWith={closeWith}
                docbuilderSlug={docbuilder.slug}
                organizationId={organizationId}
              />
            </ModalHeaderColumn>
            <ModalHeaderDivider />
            <ModalHeaderColumn>
              <ModalHeaderCloseButton closeWith={closeWith} />
            </ModalHeaderColumn>
          </Fragment>
        )}
      </ModalHeader>

      {/* === CONTENT === */}
      <ModalContent>
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

          {processedBuilderPrimaryText.length > 0 && (
            <div className={classes.primaryText}>
              <Markup content={processedBuilderPrimaryText} />
            </div>
          )}
          {subsection && subsection.docbuilder_questions.length > 0 && (
            <form className={classes.form} autoComplete="off" onSubmit={formOnSubmitHandler}>
              {subsection.docbuilder_questions.map((q, qIdx) => (
                <div key={q.id} className={classes.question}>
                  <Question
                    applyDisplayedAnswerStatus={applyDisplayedAnswerStatus}
                    displayedAnswerStatuses={displayedAnswerStatuses}
                    docbuilderVars={docbuilderVars}
                    organizationId={organizationId}
                    storedAnswer={get(answers, q.id, null)}
                    question={q}
                    readOnly={readOnly}
                    deleteAnswer={deleteAnswer}
                    submitAnswer={submitAnswer}
                    subsection={subsection}
                    subsectionStatus={subsectionStatus}
                  />
                </div>
              ))}
            </form>
          )}
        </ModalContentPrimaryWrapper>

        <ModalContentSecondaryWrapper>
          {processedBuilderSecondaryText.length > 0 && (
            <ModalContentSecondaryBlock>
              <Markup content={processedBuilderSecondaryText} />
            </ModalContentSecondaryBlock>
          )}
        </ModalContentSecondaryWrapper>

        <ModalContentTertiaryWrapper>
          {(!isNil(prevSubsectionId) || !isNil(nextSubsectionId)) && (
            <div className={classes.prevAndNext}>
              <div className={classes.prev}>
                {!isNil(prevSubsectionId) && !isNil(organizationId) && (
                  <div className={classes.prevLink}>
                    <HgButtonWithIconAndText
                      icon={ArrowBackIcon}
                      buttonProps={{
                        onClick: () => {
                          // Scroll to top of modal
                          contentContainerModalRef.current.scrollTop = 0;
                        },
                        component: Link,
                        to: `/app/account/organizations/${organizationId}/builder/${docbuilder.slug}/${originSegment}/${prevSubsectionId}`,
                      }}
                    >
                      Back
                    </HgButtonWithIconAndText>
                  </div>
                )}
              </div>
              <div className={classes.next}>
                {!isNil(nextSubsectionId) && !isNil(organizationId) && (
                  <div className={classes.nextLink}>
                    <HgButtonWithIconAndText
                      iconOnRight={true}
                      icon={ArrowForwardIcon}
                      buttonProps={{
                        onClick: () => {
                          // Scroll to top of modal
                          contentContainerModalRef.current.scrollTop = 0;
                        },
                        component: Link,
                        to: `/app/account/organizations/${organizationId}/builder/${docbuilder.slug}/${originSegment}/${nextSubsectionId}`,
                      }}
                    >
                      Next
                    </HgButtonWithIconAndText>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalContentTertiaryWrapper>
      </ModalContent>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    //
  },
  headerHeadlinesWrapper: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing(0.5, 0, 0.5, 0),
  },
  sectionHeadline: {
    alignItems: "center",
    display: "inline-flex",
    fontSize: styleVars.txtFontSizeXs,
    letterSpacing: "0.025em",
    marginBottom: theme.spacing(0.15),
    marginTop: theme.spacing(0.25),
    textTransform: "uppercase",
  },
  subsectionHeadline: {
    alignItems: "center",
    display: "inline-flex",
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    marginBottom: theme.spacing(0.25),
    marginTop: theme.spacing(0.15),
  },
  primaryText: {
    marginBottom: theme.spacing(2),
  },
  secondaryText: {
    marginBottom: theme.spacing(2),
  },
  form: {
    // ...
  },
  question: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  prevAndNext: {
    display: "flex",
    justifyContent: "space-between",
  },
  prev: {
    textAlign: "left",
  },
  next: {
    textAlign: "right",
  },
}));

const formOnSubmitHandler = (e) => {
  e.preventDefault();
};

// Returns bool value to use as errorInUnsavedAnswers.
const calculateErrorInUnsavedAnswers = (sub, subStatus, displayedAnswerStatuses) => {
  // "READY" is the only subsection status where it's appropriate for
  // us to determine if there are errors in unsaved questions. Otherwise,
  // we don't care.
  if (subStatus === statuses.READY) {
    // Return true if any of the values in it are false.
    let res = includes(displayedAnswerStatuses, false);
    return res;
  }
  return false;
};

ModalSubsection.propTypes = {
  addOrUpdateAnswers: PropTypes.func,
  answers: PropTypes.objectOf(PropTypes.shape(docbuilderAnswerCommonShape)),
  closeWith: PropTypes.func.isRequired,
  contentContainerModalRef: PropTypes.object,
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  docbuilderIsClosed: PropTypes.bool,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape),
  idForHeader: PropTypes.string.isRequired,
  organizationId: PropTypes.number.isRequired,
  readOnly: PropTypes.bool,
  deleteAnswer: PropTypes.func.isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
  subsectionStatus: PropTypes.number,
  originSegment: PropTypes.oneOf(["build", "preview"]),
  uic: PropTypes.object,
  uicSlotClosedMessage: PropTypes.string,
  uicSlotSecondaryViewAlertMessage: PropTypes.string,
  uicSlotSecondaryViewAlertSeverity: PropTypes.string,
  uicStateKey: PropTypes.string.isRequired,
  userCanEditDocbuilders: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
};
