import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "redux";
import { connect } from "react-redux";
import { get, isEmpty, isNil } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import { Popover } from "@mui/material";
import { withStyles } from "@mui/styles";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import ProgressBar from "components/ui/ProgressBar";
import clsx from "clsx";
import HelpIcon from "@mui/icons-material/Help";
import DraftEditor from "components/ui/DraftEditor";
import isJsonTextEmpty from "utils/isJsonTextEmpty";
import { organizationWithAvailableSetsShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * Provides a table of assessments available to an organization.
 *
 * One row per assessment. Perms are not checked here, so props are
 * representing them are to be provided when applicable.
 *
 * @extends Component
 */
class OrganizationSetsTable extends Component {
  static propTypes = {
    // Via caller.
    // -----------
    organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
    // progressDataUpdated: Not currently referenced in code of
    //  this component, but facilitates re-rendering that might
    //  otherwise not occur when deeply-nested progress data in
    //  the organization prop object changes.
    //  TL;DR: There must be shallow comparisons of the organization
    //  prop being done somewhere along the line, and it's preventing
    //  set progress data nested within it from triggering an update.
    //  Having this prop value allows calling code to provide an
    //  arbitrary value (typically a timestamp as from
    //  Date.now()) that will force this component to re-render.
    progressDataUpdated: PropTypes.number,
    userCanEditAssessment: PropTypes.bool.isRequired,
    userCanViewAssessment: PropTypes.bool.isRequired,
    // Via HOCs.
    // ---------
    theme: PropTypes.object.isRequired, // via withStyles
    height: PropTypes.number, // via withResizeDetector
    width: PropTypes.number, // via withResizeDetector
  };

  constructor(props) {
    super(props);
    this.state = {
      setDescriptionPopoverAnchorEl: null,
      setDescriptionPopoverSetId: null,
    };
  }

  handleSetDescriptionPopoverOpen = (event, setId) => {
    this.setState({
      setDescriptionPopoverAnchorEl: event.currentTarget,
      setDescriptionPopoverSetId: setId,
    });
  };

  handleSetDescriptionPopoverClose = () => {
    this.setState({
      setDescriptionPopoverAnchorEl: null,
      setDescriptionPopoverSetId: null,
    });
  };

  /**
   * Column definitions for our faux table.
   *
   * Be sure the widths always add up to 100, or it won't look
   * like a table.
   *
   * The render() methods here support the following params:
   *  - {Object} Set object from organization.available_sets
   *  - {Object} The organization object
   *  - {String|null} Our unofficial width size string (sm|lg)
   *  - {Boolean} Whether user has userCanEditAssessment for org
   *  - {Boolean} Whether user has userCanViewAssessment for org
   */
  colDefs = [
    // Note: Keep th/td widths aligned below as needed.
    {
      label: "Assessment",
      thStyleByWidth: { sm: { display: "none" }, lg: { width: "30%" } },
      tdStyleByWidth: {
        sm: {
          flex: "0 0 100%",
          fontWeight: this.props.styleVars.txtFontWeightDefaultMedium,
          width: "100%",
        },
        lg: {
          fontWeight: this.props.styleVars.txtFontWeightDefaultMedium,
          width: "30%",
        },
      },
      render: (dataRowObj, org, sizeStr, userCanEditAssessment, userCanViewAssessment) => {
        return (
          <div className={this.props.classes.setNameWrapper}>
            {userCanViewAssessment && (
              <Link
                to={`/app/programs/${dataRowObj.program_id}/organizations/${org.id}/sets/${dataRowObj.id}`}
              >
                {dataRowObj.name}
              </Link>
            )}
            {!userCanViewAssessment && <span>{dataRowObj.name}</span>}
            {!isJsonTextEmpty(dataRowObj.description) && (
              <React.Fragment>
                <HelpIcon
                  className={this.props.classes.setDescriptionPopoverIcon}
                  color="secondary"
                  aria-label="Assessment description"
                  aria-owns={
                    this.state.setDescriptionPopoverOpen
                      ? `set-description-popover-${dataRowObj.id}`
                      : undefined
                  }
                  aria-haspopup="true"
                  onMouseEnter={(e) => this.handleSetDescriptionPopoverOpen(e, dataRowObj.id)}
                  onMouseLeave={this.handleSetDescriptionPopoverClose}
                />
                <Popover
                  id={`set-description-popover-${dataRowObj.id}`}
                  className={this.props.classes.setDescriptionPopover}
                  open={this.state.setDescriptionPopoverSetId === dataRowObj.id}
                  onClose={this.handleSetDescriptionPopoverClose}
                  disableRestoreFocus
                  anchorEl={this.state.setDescriptionPopoverAnchorEl}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <div className={this.props.classes.setDescriptionPopoverContent}>
                    <DraftEditor
                      keyProp={dataRowObj.id}
                      value={dataRowObj.description}
                      readOnly={true}
                    />
                  </div>
                </Popover>
              </React.Fragment>
            )}
          </div>
        );
      },
    },
    {
      label: "Percent Complete",
      thStyleByWidth: { sm: { display: "none" }, lg: { width: "30%" } },
      tdStyleByWidth: {
        sm: {
          flex: "0 0 100%",
          width: "100%",
        },
        lg: {
          width: "30%",
        },
      },
      render: (dataRowObj, org, sizeStr, userCanEditAssessment, userCanViewAssessment) => (
        <ProgressBar
          value={dataRowObj.percentComplete * 100}
          linkIfZero={userCanEditAssessment}
          linkIfZeroText="Start this Assessment"
          linkIfZeroTo={`/app/programs/${dataRowObj.program_id}/organizations/${org.id}/sets/${dataRowObj.id}`}
        />
      ),
    },
    {
      label: "Last Update",
      thStyleByWidth: { sm: { display: "none" }, lg: { width: "30%" } },
      tdStyleByWidth: {
        sm: {
          width: "100%",
        },
        lg: {
          width: "30%",
        },
      },
      render: (dataRowObj, org, sizeStr, userCanEditAssessment, userCanViewAssessment) => {
        let dOut = "N/A";

        if (dataRowObj.lastResponse && dataRowObj.lastResponse.updated_at) {
          let d = dataRowObj.lastResponse.updated_at;
          dOut = moment.utc(d).fromNow();

          if (dataRowObj.lastResponse.user) {
            let nameFirst = get(dataRowObj, "lastResponse.user.name_first", "");
            let nameLast = get(dataRowObj, "lastResponse.user.name_last", "").charAt(0);
            let userName = nameFirst + " " + nameLast;

            if (moment(d).isValid()) {
              dOut += " by " + userName;
            }
          }
        }
        return (
          <React.Fragment>
            {sizeStr === "sm" ? (
              <small>Last updated: {dOut}</small>
            ) : (
              <React.Fragment>{dOut}</React.Fragment>
            )}
          </React.Fragment>
        );
      },
    },
    {
      label: "Report",
      thStyleByWidth: { sm: { display: "none" }, lg: { width: "10%" } },
      tdStyleByWidth: {
        sm: {
          width: "100%",
        },
        lg: {
          width: "10%",
        },
      },
      render: (dataRowObj, org, sizeStr, userCanEditAssessment, userCanViewAssessment) => (
        <React.Fragment>
          {userCanViewAssessment && (
            <Link
              to={`/app/programs/${dataRowObj.program_id}/organizations/${org.id}/sets/${dataRowObj.id}/report`}
            >
              {sizeStr === "sm" ? (
                <small>View report</small>
              ) : (
                <React.Fragment>Report</React.Fragment>
              )}
            </Link>
          )}
          {!userCanViewAssessment && (
            <React.Fragment>
              {sizeStr === "sm" ? (
                <small>View report</small>
              ) : (
                <React.Fragment>Report</React.Fragment>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      ),
    },
    // @TODO ENABLE WHEN AWARD FUNCTIONALITY IS READY (AND ADJUST COL STYLES)
    // ,
    // { label: 'Award',
    //    thStyleByWidth: { sm: {display:'none'}, lg: {width:'10%'} },
    //    tdStyleByWidth: {
    //    sm: {
    //       width: '100%'
    //     },
    //     lg: {
    //       width: '10%'
    //     }
    //   },
    //   render: (dataRowObj, org) => (
    //     <p>
    //       <em>Coming soon</em>
    //     </p>
    //   )
    // }
  ];

  render() {
    const { classes, organization, userCanEditAssessment, userCanViewAssessment, width } =
      this.props;

    let noSets = isNil(organization.available_sets) || isEmpty(organization.available_sets);

    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    return (
      <React.Fragment>
        {noSets ? (
          <em>No available assessments.</em>
        ) : (
          <React.Fragment>
            <div className={clsx(classes.fauxTableHeader, sizeStr)}>
              <div className={clsx(classes.fauxTableHeaderRow, sizeStr)}>
                {/* FAUX TABLE HEADER ROW */}
                {this.colDefs.map((defObj, defObjIdx) => (
                  <div
                    key={`col${defObjIdx}`}
                    style={defObj.thStyleByWidth[sizeStr]}
                    className={classes.fauxTableHeaderCell}
                  >
                    {defObj.label}
                  </div>
                ))}
              </div>
            </div>

            <div className={clsx(classes.fauxTableBody, sizeStr)}>
              {/* FAUX TABLE BODY */}
              {organization.available_sets.map((set, idx) => (
                <div key={`row${idx}`} className={clsx(classes.fauxTableBodyRow, sizeStr)}>
                  {this.colDefs.map((defObj, defObjIdx) => (
                    <div
                      key={`row${idx}_col${defObjIdx}`}
                      style={defObj.tdStyleByWidth[sizeStr]}
                      className={clsx(classes.fauxTableBodyCell, sizeStr)}
                    >
                      {defObj.render(
                        set,
                        organization,
                        sizeStr,
                        userCanEditAssessment,
                        userCanViewAssessment
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const maxSmWidth = 799;

const styles = (theme) => ({
  setNameWrapper: {
    display: "flex", // prevents weirdness with the help icon
  },
  setDescriptionPopoverIcon: {
    fontSize: 18,
    marginLeft: theme.spacing(0.5),
  },
  setDescriptionPopover: {
    maxWidth: "800px",
    pointerEvents: "none",
  },
  fauxTableHeader: {
    "&.sm": {
      // we'll use this element as a spacer at small sizes
      height: theme.spacing(2),
    },
  },
  fauxTableHeaderRow: {
    display: "none",
    "&.lg": {
      display: "flex",
    },
  },
  fauxTableHeaderCell: {
    flex: "0 0 auto", // width is set inline
    padding: styleVars.tblHeadCellPadding,
    fontFamily: styleVars.txtFontFamilyTableHead,
    fontSize: styleVars.txtFontSizeTableHead,
    fontWeight: styleVars.txtFontWeightTableHead,
    lineHeight: styleVars.txtLineHeightTableHead,
    textTransform: "uppercase",
  },
  fauxTableBody: {},
  fauxTableBodyRow: {
    border: `2px solid ${styleVars.colorLightGray}`,
    display: "flex",
    flexWrap: "wrap",
    marginBottom: theme.spacing(0.75),
    "&.sm": {
      paddingBottom: theme.spacing(),
      paddingTop: theme.spacing(2),
    },
    "&.lg": {
      flexWrap: "nowrap",
    },
  },
  fauxTableBodyCell: {
    flex: "0 0 auto", // Default only. Col-specific overrides are in colDefs.
    padding: styleVars.tblBodyCellPadding,
    fontFamily: styleVars.txtFontFamilyTableBody,
    fontSize: styleVars.txtFontSizeTableBody,
    fontWeight: styleVars.txtFontWeightTableBody,
    lineHeight: styleVars.txtLineHeightTableBody,
    "&.sm": {
      paddingBottom: theme.spacing(0.5),
      paddingTop: theme.spacing(0.5),
    },
  },
});

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withResizeDetector(withStyles(styles, { withTheme: true })(OrganizationSetsTable))
);
