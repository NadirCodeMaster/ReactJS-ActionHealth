import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import SubsectionStatusIndicator from "../Other/SubsectionStatusIndicator";
import {
  docbuilderWithSectionsShape,
  docbuilderSectionWithSubsectionsShape,
  docbuilderSubsectionWithQuestionsShape,
} from "../../prop-type-shapes";
import { Markup } from "interweave";
import styleVars from "style/_vars.scss";

//
// Single subsection as displayed with others in Section.
//

export default function Subsection({ docbuilder, organizationId, section, subsection, status }) {
  const classes = useStyles();

  return (
    <Link
      to={`/app/account/organizations/${organizationId}/builder/${docbuilder.slug}/build/${subsection.id}`}
      className={classes.subsectionLink}
    >
      <div className={classes.subsectionBuilderHeadline}>
        <Markup content={subsection.builder_headline} />
      </div>
      <div className={classes.subsectionStatusIndicatorWrapper}>
        <SubsectionStatusIndicator status={status} />
      </div>
    </Link>
  );
}

const useStyles = makeStyles((theme) => ({
  subsectionLink: {
    backgroundColor: styleVars.colorWhite,
    border: `2px solid ${styleVars.colorLightGray}`,
    borderRadius: "3px",
    color: styleVars.txtColorDefault,
    display: "flex",
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    justifyContent: "space-between",
    padding: theme.spacing(1, 1.5, 1, 1.5),
  },
  subsectionBuilderHeadline: {
    alignSelf: "center",
    paddingTop: "1px",
  },
  subsectionStatusIndicatorWrapper: {
    display: "inline-flex",
    padding: theme.spacing(),
  },
}));

Subsection.propTypes = {
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  organizationId: PropTypes.number.isRequired,
  section: PropTypes.shape(docbuilderSectionWithSubsectionsShape).isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionWithQuestionsShape).isRequired,
  status: PropTypes.number,
};
