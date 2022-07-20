import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { NavHashLink } from "react-router-hash-link";
import { has } from "lodash";
import { makeStyles } from "@mui/styles";
import Subsection from "./Subsection";
import SubsectionProcessor from "../../classes/SubsectionProcessor";
import {
  docbuilderWithSectionsShape,
  docbuilderSectionWithSubsectionsShape,
} from "../../prop-type-shapes";
import { organizationShape } from "constants/propTypeShapes";
import scrollWithOffset from "utils/scrollWithOffset";
import styleVars from "style/_vars.scss";

//
// Single section as displayed with others in Build.
//

export default function Section({
  organization,
  docbuilder,
  section,
  sectionNumber,
  subsectionStatuses, // object: subsection.id => subsectionStatus (number)
}) {
  const classes = useStyles();

  return (
    <Fragment>
      <header className={classes.header}>
        <h2 className={classes.sectionName} id={`${section.slug}-${section.id}`}>
          <NavHashLink
            scroll={(el) => scrollWithOffset(el)}
            className={classes.sectionLink}
            activeClassName={classes.sectionLinkActive}
            to={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/build#${section.slug}-${section.id}`}
          >
            {section.builder_headline}
          </NavHashLink>
        </h2>
      </header>
      {section.docbuilder_subsections.length > 0 && (
        <ul className={classes.subsectionsList}>
          {section.docbuilder_subsections.map((subsection) => (
            <Fragment key={subsection.id}>
              {!subsection.exclude_from_builder && (
                <li className={classes.subsectionsListItem}>
                  <Subsection
                    docbuilder={docbuilder}
                    organizationId={organization.id}
                    section={section}
                    subsection={subsection}
                    status={
                      has(subsectionStatuses, subsection.id)
                        ? subsectionStatuses[subsection.id]
                        : SubsectionProcessor.defaultStatusForSubsection(subsection)
                    }
                  />
                </li>
              )}
            </Fragment>
          ))}
        </ul>
      )}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  header: {
    //
  },
  sectionName: {
    color: styleVars.txtColorLight,
    fontSize: styleVars.txtFontSizeXs,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  sectionLink: {
    color: styleVars.txtColorMutedLink,
  },
  sectionLinkActive: {
    color: styleVars.txtColorLink,
  },
  subsectionsList: {
    display: "block",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    paddingBottom: theme.spacing(3),
  },
  subsectionsListItem: {
    display: "block",
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
    padding: 0,
  },
}));

Section.propTypes = {
  organization: PropTypes.shape(organizationShape).isRequired,
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  section: PropTypes.shape(docbuilderSectionWithSubsectionsShape).isRequired,
  sectionNumber: PropTypes.number,
  subsectionStatuses: PropTypes.object,
};
