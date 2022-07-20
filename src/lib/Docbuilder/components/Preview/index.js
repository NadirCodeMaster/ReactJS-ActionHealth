import React, { Fragment, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get } from "lodash";
import { Button, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import FinalLinkIcon from "../Other/FinalLinkIcon";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { useReactToPrint } from "react-to-print";
import clsx from "clsx";
import Section from "./Section";
import ViewAlert from "../Other/ViewAlert";
import PageNotFound from "components/views/PageNotFound";
import {
  docbuilderSubsectionWithRenderShape,
  docbuilderWithSectionsShape,
} from "../../prop-type-shapes";
import { organizationShape } from "constants/propTypeShapes";
import sectionShouldShowInPreview from "../../utils/section/sectionShouldShowInPreview";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

//
// Docbuilder preview page.
//

export default function Preview({
  organization,
  docbuilder,
  docbuilderIsClosed,
  buildPath,
  loadingFullPreview, // bool
  previewContent, // object: subsection.id => subsection (w/`_render` prop)
  sectionNumbering, // object: section.id => section number (number|null)
  submittableStatus,
  subsectionStatuses, // object: subsection.id => subsectionStatus (number)
  toggleDownloadModal,
  uic,
  uicSlotClosedMessage,
  uicSlotFinalLinkText,
  uicSlotPreviewBackLinkText,
  uicSlotPreviewPrintLinkText,
  uicSlotPrimaryViewAlertMessage,
  uicSlotPrimaryViewAlertSeverity,
  uicStateKey,
  userCanEditDocbuilders,
  userCanViewDocbuilders,
}) {
  const printableRef = useRef();

  const handlePrint = useReactToPrint({
    pageStyle: printPageStyle,
    content: () => printableRef.current,
  });

  const classes = useStyles();

  // General set-up based on props.
  useEffect(() => {
    if (userCanViewDocbuilders) {
      generateTitle(`${docbuilder.name} (preview) for ${organization.name}`);
    }
  }, [docbuilder, organization, userCanViewDocbuilders]);

  if (!userCanViewDocbuilders || !organization || !docbuilder) {
    return <PageNotFound />;
  }

  // Whether modal should be open or not.
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
        <Breadcrumb
          path={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/preview`}
        >
          Preview
        </Breadcrumb>
      </Breadcrumbs>

      <header className={classes.header}>
        <h1 className={classes.pageTitle}>{docbuilder.name} - Preview</h1>

        <Paper className={classes.headerSecondaryContent}>
          <div className={classes.headerSecondaryContentBlock1}>
            <Button
              component={Link}
              to={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/build`}
            >
              <div className={clsx(classes.headerButtonIcon, classes.headerButtonIconInGroup1)}>
                <ChevronLeftIcon />
              </div>
              <div className={clsx(classes.headerButtonText, classes.headerButtonTextInGroup1)}>
                {uicSlotPreviewBackLinkText && <Fragment>{uicSlotPreviewBackLinkText}</Fragment>}
              </div>
            </Button>
          </div>

          <div className={classes.headerSecondaryContentBlock2}>
            <Button onClick={handlePrint}>
              <div className={clsx(classes.headerButtonIcon, classes.headerButtonIconInGroup2)}>
                <PrintOutlinedIcon color="primary" />
              </div>
              <div className={clsx(classes.headerButtonText, classes.headerButtonTextInGroup2)}>
                {uicSlotPreviewPrintLinkText && <Fragment>{uicSlotPreviewPrintLinkText}</Fragment>}
              </div>
            </Button>

            <div className={classes.headerSecondaryContentBlock2ButtonDivider} />

            <Button onClick={() => toggleDownloadModal(true)}>
              <div className={clsx(classes.headerButtonIcon, classes.headerButtonIconInGroup2)}>
                <FinalLinkIcon submittableStatus={submittableStatus} />
              </div>
              <div className={clsx(classes.headerButtonText, classes.headerButtonTextInGroup2)}>
                {uicSlotFinalLinkText && <Fragment>{uicSlotFinalLinkText}</Fragment>}
              </div>
            </Button>
          </div>
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
        small={false}
        marginBottom={"1em"}
        marginTop={"1em"}
        message={uicSlotPrimaryViewAlertMessage}
        severity={uicSlotPrimaryViewAlertSeverity}
      ></ViewAlert>

      {loadingFullPreview && <CircularProgressGlobal />}

      <Paper ref={printableRef} className={classes.primary}>
        {docbuilder.docbuilder_sections.length < 1 ? (
          <div>
            <em>It appears this document has no sections.</em>
          </div>
        ) : (
          <div
            className={clsx(classes.sections, {
              [classes.sectionsWhileLoadingFullPreview]: loadingFullPreview,
            })}
          >
            {docbuilder.docbuilder_sections.map((section) => (
              <React.Fragment key={section.machine_name}>
                {sectionShouldShowInPreview(section) && (
                  <div className={classes.section}>
                    <Section
                      organization={organization}
                      docbuilder={docbuilder}
                      section={section}
                      sectionNumber={get(sectionNumbering, section.id, null)}
                      previewContent={previewContent}
                      subsectionStatuses={subsectionStatuses}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </Paper>
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(3),
  },
  headerSecondaryContent: {
    padding: theme.spacing(0.5, 1, 0.5, 1),
    textAlign: "center",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      textAlign: "unset",
    },
  },
  headerSecondaryContentBlock1: {
    //
  },
  headerSecondaryContentBlock2: {
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.up("sm")]: {
      justifyContent: "normal",
    },
  },
  headerButtonIcon: {
    //
  },
  headerButtonIconInGroup1: {
    color: styleVars.txtColorLight,
    display: "flex",
    fontSize: styleVars.txtFontSizeSm,
  },
  headerButtonIconInGroup2: {
    color: styleVars.txtColorLink,
    display: "flex",
    fontSize: styleVars.txtFontSizeDefault,
    marginRight: theme.spacing(0.5),
  },
  headerButtonText: {
    display: "flex",
    fontWeight: styleVars.txtFontWeightDefaultNormal,
  },
  headerButtonTextInGroup1: {
    color: styleVars.txtColorLight,
    fontSize: styleVars.txtFontSizeSm,
    textTransform: "uppercase",
  },
  headerButtonTextInGroup2: {
    color: styleVars.txtColorLink,
    fontSize: styleVars.txtFontSizeDefault,
    fontWeight: styleVars.txtFontWeightDefaultLight,
    letterSpacing: "normal",
    textTransform: "none",
  },
  headerSecondaryContentBlock2ButtonDivider: {
    backgroundColor: styleVars.colorLightGray,
    height: "inherit",
    margin: theme.spacing(0.5, 1),
    width: "2px",
  },
  pageTitle: {
    //
  },
  primary: {
    padding: styleVars.paperPadding,
    "@media print": {
      border: "none",
      boxShadow: "none",
      padding: 0,
    },
  },
  sections: {
    display: "block",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    transition: "opacity 0.75s",
  },
  sectionsWhileLoadingFullPreview: {
    opacity: "0.25",
  },
  section: {
    display: "block",
    margin: theme.spacing(0, 0, 3, 0),
    padding: 0,
  },
}));

// Print styles below apply only to printing triggered
// via useReactToPrint().
const printPageStyle = `
  @page {
    margin: 3cm 3cm 3cm 2cm;
  }
`;

Preview.propTypes = {
  docbuilder: PropTypes.shape(docbuilderWithSectionsShape).isRequired,
  docbuilderIsClosed: PropTypes.bool,
  organization: PropTypes.shape(organizationShape).isRequired,
  buildPath: PropTypes.string.isRequired,
  loadingFullPreview: PropTypes.bool.isRequired,
  previewContent: PropTypes.objectOf(PropTypes.shape(docbuilderSubsectionWithRenderShape)),
  sectionNumbering: PropTypes.object,
  submittableStatus: PropTypes.number,
  subsectionStatuses: PropTypes.object,
  toggleDownloadModal: PropTypes.func,
  uic: PropTypes.object,
  uicSlotClosedMessage: PropTypes.string,
  uicSlotFinalLinkText: PropTypes.string,
  uicSlotPreviewBackLinkText: PropTypes.string,
  uicSlotPreviewPrintLinkText: PropTypes.string,
  uicSlotPrimaryViewAlertMessage: PropTypes.string,
  uicSlotPrimaryViewAlertSeverity: PropTypes.string,

  uicStateKey: PropTypes.string.isRequired,
  userCanEditDocbuilders: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
};
