import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { get, find, isNil } from "lodash";
import alignmentValueImages from "utils/alignmentValueImages";
import styleVars from "style/_vars.scss";

/**
 * Assessment Topics (modules) table
 */
export default function AssessmentTopicsTable({
  set,
  mod,
  criterionInstances,
  orgProgData,
  responsesLoading,
  responsesError,
  responses,
  orgId,
  progId,
}) {
  const classes = useStyles();
  const appMeta = useSelector((state) => state.app_meta);
  const { width, ref } = useResizeDetector();
  const maxSmWidth = 599;
  let sizeStr = width > maxSmWidth ? "lg" : "sm";

  // Extract ratio of questions answered vs total questions within a topic
  const moduleAnsweredRatio = () => {
    let moduleStatusData = {};
    let modulePossibleResp = 0;
    let moduleActualResp = 0;

    if (!isNil(orgProgData.program.sets[set.id])) {
      let setForStats = orgProgData.program.sets[set.id];
      moduleStatusData = !isNil(setForStats.modules) ? setForStats.modules : {};
    }

    if (!isNil(moduleStatusData[mod.id])) {
      moduleActualResp = moduleStatusData[mod.id].actualResponses;
      modulePossibleResp = moduleStatusData[mod.id].possibleResponses;
    }

    return `${moduleActualResp}/${modulePossibleResp}`;
  };

  /**
   * Gets label from response structure (IE 'Partially in place')
   * @param {object} ci (criterion instance)
   */
  const statusDisplay = (ci) => {
    if (responsesLoading) {
      return "loading...";
    }

    let thisResp = find(responses, (resp) => {
      return ci.criterion_id === resp.criterion_id;
    });

    if (!thisResp) {
      return "Unanswered";
    } else {
      let responseStructures = get(appMeta.data, "responseStructures", "");
      let responseStructureId = get(thisResp.response_value, "response_structure_id", "");
      let responseStructureValues = responseStructures[responseStructureId].response_value;

      return find(responseStructureValues, (rsv) => {
        return Number(rsv.id) === Number(thisResp.response_value.id);
      }).label;
    }
  };

  /**
   * Gets image from based on response structure
   * @param {object} ci (criterion instance)
   */
  const alignmentImage = (ci) => {
    let alignment = null;

    if (responsesLoading || responsesError) {
      return;
    }

    let thisResp = find(responses, (resp) => {
      return ci.criterion_id === resp.criterion_id;
    });

    if (thisResp) {
      alignment = get(thisResp, "response_value.alignment", 0);
      return alignmentValueImages(alignment);
    }

    // Passing null returns "Unanswered" image
    return alignmentValueImages(null);
  };

  return (
    <div ref={ref}>
      <Accordion className={classes.topicsAccordion} classes={{ root: classes.accordionRoot }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel-content-module-${mod.id}`}
          id={`panel-header-module-${mod.id}`}
          classes={{ root: classes.accordionSummaryRoot }}
        >
          <div className={clsx(classes.summaryContainer, sizeStr)}>
            <div className={clsx(classes.modName, sizeStr)}>{mod.name}</div>
            <div className={clsx(classes.fractionCompleted, sizeStr)}>
              {moduleAnsweredRatio()} Answered
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails classes={{ root: classes.accordionDetailsRoot }}>
          {criterionInstances.length > 0 && (
            <div className={classes.detailRowWrapper}>
              {criterionInstances.map((ci, index) => {
                let isFirst = index === 0;

                return (
                  <div
                    key={`ciRow_${index}`}
                    className={clsx(
                      classes.detailRowContainer,
                      sizeStr,
                      !isFirst ? "notFirst" : null
                    )}
                  >
                    <div className={clsx(classes.criterionHandleCell, sizeStr)}>
                      <span className={classes.criterionHandleText}>{ci.handle}</span>
                    </div>
                    <div className={clsx(classes.criterionNameCell, sizeStr)}>
                      <Link
                        to={`/app/programs/${progId}/organizations/${orgId}/sets/${set.id}/questions/${ci.id}`}
                      >
                        {ci.criterion.name}
                      </Link>
                    </div>
                    <div className={clsx(classes.criterionStatusCell, sizeStr)}>
                      <div className={classes.criterionStatusWrapper}>
                        <img alt="" className={classes.alignmentImage} src={alignmentImage(ci)} />
                        <span>{statusDisplay(ci)}</span>
                      </div>
                    </div>
                    <div className={clsx(classes.criterionActionCell, sizeStr)}>
                      <Link
                        to={`/app/programs/${progId}/organizations/${orgId}/sets/${set.id}/questions/${ci.id}`}
                      >
                        {statusDisplay(ci) === "Unanswered" ? "Answer" : "View"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {criterionInstances.length < 1 && (
            <p className={classes.noCriterionText}>
              No questions are currently available in this topic.
            </p>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  alignmentImage: {
    height: "15px",
    marginRight: theme.spacing(0.5),
  },
  accordionRoot: {
    border: "none",
    backgroundColor: theme.palette.background.default,
  },
  accordionSummaryRoot: {
    borderTop: `2px solid ${styleVars.colorLightGray}`,
    borderLeft: `2px solid ${styleVars.colorLightGray}`,
    borderRight: `2px solid ${styleVars.colorLightGray}`,
    borderBottom: `2px solid ${styleVars.colorDarkGray}`,
    borderTopRightRadius: "4px 4px",
    borderTopLeftRadius: "4px 4px",
  },
  accordionDetailsRoot: {
    backgroundColor: "white",
  },
  topicsAccordion: {
    width: "100%",
  },
  detailRowWrapper: {
    width: "100%",
  },
  detailRowContainer: {
    "&.lg": {
      display: "flex",
    },
    "&.notFirst": {
      borderTop: `2px solid ${styleVars.colorLightGray}`,
    },
    width: "100%",
    padding: theme.spacing(1, 0, 1, 0),
  },
  criterionHandleCell: {
    "&.lg": {
      width: "10%",
      marginRight: theme.spacing(),
    },
    "&.sm": {
      marginBottom: theme.spacing(0.5),
    },
    color: styleVars.txtColorLight,
    textTransform: "uppercase",
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  criterionHandleText: {
    verticalAlign: "text-top",
  },
  criterionNameCell: {
    "&.lg": {
      width: "50%",
      marginRight: theme.spacing(),
    },
    "&.sm": {
      marginBottom: theme.spacing(0.5),
    },
  },
  criterionStatusCell: {
    "&.lg": {
      width: "25%",
    },
    "&.sm": {
      marginBottom: theme.spacing(0.5),
    },
  },
  criterionStatusWrapper: {
    display: "flex",
    alignItems: "center",
  },
  criterionActionCell: {
    "&.lg": {
      width: "15%",
    },
  },
  summaryContainer: {
    "&.lg": {
      display: "flex",
    },
    width: "100%",
  },
  modName: {
    "&.lg": {
      width: "63%",
    },
    fontSize: styleVars.txtFontSizeLg,
  },
  fractionCompleted: {
    "&.lg": {
      width: "37%",
    },
  },
  noCriterionText: {
    fontStyle: "italic",
  },
}));

AssessmentTopicsTable.propTypes = {
  set: PropTypes.object,
  mod: PropTypes.object,
  criterionInstances: PropTypes.array,
  orgProgData: PropTypes.object,
  orgId: PropTypes.number,
  progId: PropTypes.number,
};
