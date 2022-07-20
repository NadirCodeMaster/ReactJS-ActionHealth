import React, { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "lodash";
import PropTypes from "prop-types";
import { List, ListItem, ListItemIcon, ListItemText, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import PreviewLinkIcon from "../Other/PreviewLinkIcon";
import FinalLinkIcon from "../Other/FinalLinkIcon";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import PageNotFound from "components/views/PageNotFound";
import Section from "./Section";
import ViewAlert from "../Other/ViewAlert";
import { docbuilderWithSectionsShape } from "../../prop-type-shapes";
import { organizationShape } from "constants/propTypeShapes";
import sectionShouldShowInBuilder from "../../utils/section/sectionShouldShowInBuilder";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

//
// Docbuilder build page. Lists the sections in that docbuilder.
//

export default function Build({
  organization,
  docbuilder,
  docbuilderIsClosed,
  previewPath,
  sectionNumbering, // object: section.id => section number (number|null)
  submittableStatus,
  subsectionStatuses, // object: subsection.id => subsectionStatus (number)
  toggleDownloadModal,
  uic,
  uicSlotClosedMessage,
  uicSlotFinalLinkText,
  uicSlotPreviewLinkText,
  uicSlotPrimaryViewAlertMessage,
  uicSlotPrimaryViewAlertSeverity,
  uicStateKey,
  userCanViewDocbuilders,
  userCanEditDocbuilders,
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
  const [showableSections, setShowableSections] = useState([]);

  // General set-up based on props.
  useEffect(() => {
    let newShowableSections = [];
    for (let i = 0; i < docbuilder.docbuilder_sections.length; i++) {
      if (sectionShouldShowInBuilder(docbuilder.docbuilder_sections[i])) {
        newShowableSections.push(docbuilder.docbuilder_sections[i]);
      }
    }
    if (mounted.current) {
      setShowableSections(newShowableSections);
    }
    generateTitle(`${docbuilder.name} for ${organization.name}`);
  }, [docbuilder, organization, userCanViewDocbuilders]);

  if (!userCanViewDocbuilders || !organization || !docbuilder) {
    return <PageNotFound />;
  }

  return (
    <Fragment>
      <Breadcrumbs>
        <Breadcrumb path={`/app/account`} root>
          Account
        </Breadcrumb>
        <Breadcrumb path={`/app/account/organizations/${organization.id}`}>
          {organization.name}
        </Breadcrumb>
        <Breadcrumb
          path={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/build`}
        >
          {docbuilder.name}
        </Breadcrumb>
      </Breadcrumbs>
      <header className={classes.header}>
        <h1 className={classes.pageTitle}>{docbuilder.name}</h1>
        <Paper className={classes.headerSecondaryContent}>
          <List dense disablePadding={false} component="nav">
            <ListItem button component={Link} to={previewPath}>
              <ListItemIcon>
                <PreviewLinkIcon />
              </ListItemIcon>
              <ListItemText
                primary={uicSlotPreviewLinkText || ""}
                className={classes.headerListItemText}
                disableTypography
              />
            </ListItem>
            <ListItem button onClick={() => toggleDownloadModal(true)}>
              <ListItemIcon>
                <FinalLinkIcon submittableStatus={submittableStatus} />
              </ListItemIcon>
              <ListItemText
                primary={uicSlotFinalLinkText || ""}
                className={classes.headerListItemText}
                disableTypography
              />
            </ListItem>
          </List>
        </Paper>
      </header>

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
        marginBottom={"1em"}
        marginTop={"1em"}
        message={uicSlotPrimaryViewAlertMessage}
        severity={uicSlotPrimaryViewAlertSeverity}
        small={false}
      ></ViewAlert>

      {showableSections.length < 1 ? (
        <Paper style={{ padding: styleVars.paperPadding }}>
          <em>No sections available.</em>
        </Paper>
      ) : (
        <ul className={classes.sectionsList}>
          {showableSections.map((section) => (
            <li key={section.machine_name} className={classes.sectionsListItem}>
              <Section
                organization={organization}
                docbuilder={docbuilder}
                section={section}
                sectionNumber={get(sectionNumbering, section.id, null)}
                subsectionStatuses={subsectionStatuses}
              />
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
    },
  },
  headerSecondaryContent: {
    backgroundColor: styleVars.colorWhite,
    position: "relative",
    [theme.breakpoints.up("sm")]: {
      border: "none",
      backgroundColor: "transparent",
    },
    "&::after": {
      [theme.breakpoints.up("sm")]: {
        backgroundColor: styleVars.colorLightGray,
        content: '""',
        display: "block",
        height: "2px",
        left: theme.spacing(2),
        position: "absolute",
        top: theme.spacing(0.5),
        width: "40%",
      },
    },
  },
  headerListItemText: {
    color: styleVars.txtColorLink,
  },
  pageTitle: {
    //
  },
  sectionsList: {
    display: "block",
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
  sectionsListItem: {
    display: "block",
    margin: 0,
    padding: 0,
  },
}));

Build.propTypes = {
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  docbuilderIsClosed: PropTypes.bool,
  organization: PropTypes.shape(organizationShape).isRequired,
  previewPath: PropTypes.string.isRequired,
  sectionNumbering: PropTypes.object,
  submittableStatus: PropTypes.number,
  subsectionStatuses: PropTypes.object,
  toggleDownloadModal: PropTypes.func,
  uic: PropTypes.object,
  uicSlotClosedMessage: PropTypes.string,
  uicSlotFinalLinkText: PropTypes.string,
  uicSlotPreviewLinkText: PropTypes.string,
  uicSlotPrimaryViewAlertMessage: PropTypes.string,
  uicSlotPrimaryViewAlertSeverity: PropTypes.string,
  uicStateKey: PropTypes.string.isRequired,
  userCanEditDocbuilders: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
};
