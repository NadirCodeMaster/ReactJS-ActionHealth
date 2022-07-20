import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { has } from "lodash";
import { makeStyles } from "@mui/styles";
import {
  docbuilderWithSectionsShape,
  docbuilderSectionWithSubsectionsShape,
  docbuilderSubsectionWithRenderShape,
} from "../../prop-type-shapes";
import SubsectionProcessor from "../../classes/SubsectionProcessor";
import clsx from "clsx";
import { organizationShape } from "constants/propTypeShapes";
import Subsection from "./Subsection";
import SubsectionStatusIndicator from "../Other/SubsectionStatusIndicator";
import sectionHasIncludedSubs from "../../utils/section/sectionHasIncludedSubs";
import styleVars from "style/_vars.scss";

//
// Single section as displayed with others in DocbuilderPreview.
//

export default function Section({
  organization,
  docbuilder,
  previewContent, // object: subsection.id => subsection (w/`_render` prop)
  section,
  sectionNumber,
  subsectionStatuses, // object: subsection.id => subsectionStatus (number)
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

  // Array of objects with template vars for each subsection.
  const [subs, setSubs] = useState([]);

  // Indicates that no subs of this section are includable.
  const [allSubsAreExcluded, setAllSubsAreExcluded] = useState(false);

  // Setup array of subs to render.
  useEffect(() => {
    let res = [];
    for (let i = 0; i < section.docbuilder_subsections.length; i++) {
      let s = section.docbuilder_subsections[i];
      // Only need to add this subsection if it exists in previewContent.
      if (has(previewContent, s.id)) {
        let thisSub = {};
        thisSub.id = s.id;
        thisSub.subsectionWithRender = previewContent[s.id];

        // Set-up link to subsection modal.
        // If subsection is excluded from builder, we don't show a link.
        thisSub.showSubLink = !s.exclude_from_builder;
        thisSub.subLinkText = "Info"; // default, used only for subs w/out editable stuff.
        // If the SS has editable stuff, adjust link text.
        if (s.docbuilder_questions.length > 0) {
          thisSub.subLinkText = "Edit";
        }

        thisSub.showStatusIcon = thisSub.showSubLink;
        thisSub.status = SubsectionProcessor.defaultStatusForSubsection(s);
        if (has(subsectionStatuses, s.id)) {
          thisSub.status = subsectionStatuses[s.id];
        }
        thisSub.showMeta = thisSub.showSubLink || thisSub.showStatusIcon;
        res.push(thisSub);
      }
    }

    if (mounted.current) {
      setSubs(res);
    }
  }, [previewContent, section, subsectionStatuses]);

  useEffect(() => {
    let newAllSubsAreExcluded = true;
    if (sectionHasIncludedSubs(section, subsectionStatuses)) {
      newAllSubsAreExcluded = false;
    }
    setAllSubsAreExcluded(newAllSubsAreExcluded);
  }, [section, subsectionStatuses]);

  // If meta, there's nothing to display.
  if (section.is_meta) {
    return null;
  }

  return (
    <Fragment>
      {sectionHeader(section, sectionNumber, allSubsAreExcluded, classes)}

      {section.docbuilder_subsections.length > 0 && (
        <div className={classes.subsections}>
          {subs.map((sub) => (
            <React.Fragment key={sub.id}>
              <div className={classes.subsectionRow}>
                <div className={classes.subsectionContent}>
                  <Subsection
                    subsectionWithRender={sub.subsectionWithRender}
                    subsectionStatus={sub.status}
                  />
                </div>
                <div className={clsx("no-print", classes.subsectionMeta)}>
                  {sub.showMeta && (
                    <div className={classes.subsectionMetaInner}>
                      <Fragment>
                        {sub.showStatusIcon && (
                          <div className={classes.subsectionStatusWrapper}>
                            <SubsectionStatusIndicator status={sub.status} />
                          </div>
                        )}
                        {sub.showSubLink && (
                          <Link
                            to={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/preview/${sub.id}`}
                          >
                            {sub.subLinkText}
                          </Link>
                        )}
                      </Fragment>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </Fragment>
  );
}

// Construct header JSX for a given section.
const sectionHeader = (section, sectionNumber, allSubsAreExcluded, classes) => {
  let sectionNumberOutput = null;
  if (sectionNumber && section.is_numbered) {
    sectionNumberOutput = <span>{sectionNumber}. </span>;
  }
  return (
    <React.Fragment>
      <header
        className={clsx(classes.header, {
          [classes.headerNoIncludableSubs]: allSubsAreExcluded,
        })}
      >
        <h2 className={classes.sectionName}>
          {sectionNumberOutput}
          {section.doc_headline}
        </h2>
      </header>
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  header: {
    //
  },
  headerNoIncludableSubs: {
    textDecoration: "line-through",
  },
  sectionName: {
    [theme.breakpoints.up("sm")]: {
      marginRight: "20%",
    },
  },
  subsections: {
    margin: 0,
    padding: 0,
  },
  subsectionRow: {
    margin: "0 0 2em",
    padding: 0,
    [theme.breakpoints.up("sm")]: {
      display: "flex",
      justifyContent: "space-between",
    },
  },
  subsectionContent: {
    [theme.breakpoints.up("sm")]: {
      width: "74%",
    },
  },
  subsectionMeta: {
    marginBottom: theme.spacing(4),
    paddingTop: theme.spacing(),
    [theme.breakpoints.up("sm")]: {
      marginBottom: 0,
      paddingTop: 0,
      width: "16%",
    },
  },
  subsectionMetaInner: {
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-start",
    position: "relative",
    "&::after": {
      [theme.breakpoints.up("sm")]: {
        backgroundColor: styleVars.colorLightGray,
        content: '""',
        height: "2px",
        position: "absolute",
        top: theme.spacing(-2),
        left: 0,
        width: "100%",
      },
    },
  },
  subsectionStatusWrapper: {
    marginRight: theme.spacing(),
  },
}));

Section.propTypes = {
  organization: PropTypes.shape(organizationShape).isRequired,
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  previewContent: PropTypes.objectOf(PropTypes.shape(docbuilderSubsectionWithRenderShape)),
  section: PropTypes.shape(docbuilderSectionWithSubsectionsShape).isRequired,
  sectionNumber: PropTypes.number,
  subsectionStatuses: PropTypes.object,
};
