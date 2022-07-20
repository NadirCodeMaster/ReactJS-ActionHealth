import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { isEmpty, map } from "lodash";
import SearchBar from "components/ui/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmButton from "components/ui/ConfirmButton";
import {
  Button,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

/**
 * UI for Resource Translation Groups for resource admin detail page
 */

class ResourceTranslationGroup extends React.Component {
  static propTypes = {
    getResourcesRequest: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    resources: PropTypes.array,
    resourcesLoading: PropTypes.bool.isRequired,
    updateResource: PropTypes.func.isRequired,
    populateTranslationGroupResource: PropTypes.func.isRequired,
    translationGroupResource: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
    this.maxResultsPerSearch = 600;
    this.searchBarRef = React.createRef();

    this.state = {
      submitting: false, // submitting add request to API
      selectedResource: null,
      searching: false,
    };
  }

  componentDidMount() {
    const { populateTranslationGroupResource, resource } = this.props;

    if (resource.translation_group_id) {
      populateTranslationGroupResource(resource.translation_group_id);
    }
  }

  componentDidUpdate(prevProps) {
    const { resource: prevResource } = prevProps;
    const { resource, populateTranslationGroupResource } = this.props;

    if (resource.translation_group_id !== prevResource.translation_group_id) {
      populateTranslationGroupResource(resource.translation_group_id);
    }
  }

  /**
   * Calls search function
   * @param {object} search
   */
  executeSearch = (search) => {
    const { getResourcesRequest, resource } = this.props;

    let resourceRequestParams = {
      name_sort: "asc",
      per_page: this.maxResultsPerSearch,
      translation_group_id: "is_null",
      not_language_id: resource.language_id,
      ...search,
    };

    getResourcesRequest(resourceRequestParams);
  };

  /**
   * calls updateResource function, adding specified translation_group_id
   * (the ID of selectedResource)
   */
  updateTranslationGroupResource = () => {
    const { selectedResource } = this.state;
    const { resource, updateResource } = this.props;

    this.searchBarRef.current.clearSearch();

    updateResource(resource.id, { translation_group_id: selectedResource.id });
  };

  /**
   * selectedResource handling
   * @param {object} selectedItem
   */
  handleSelectResourceFromSearch = (selectedResource) => {
    this.setState({
      selectedResource: selectedResource ? selectedResource : null,
    });
  };

  /**
   * Unlinks resource from grouping resource
   */
  unlinkFromGroupingResource = (itemId) => {
    const { resource, updateResource } = this.props;

    updateResource(resource.id, { translation_group_id: null });
  };

  /**
   * @returns {boolean} is a grouping resource
   */
  isGroupingResource = () => {
    const { resource } = this.props;

    return resource.translation_group_id === null && !isEmpty(resource.translations);
  };

  /**
   * @params {object} event
   * @params {string} resource id
   */
  handleRowClick = (e, id) => {
    const win = window.open(`/app/admin/resources/${id}`, "_blank");
    if (win != null) {
      win.focus();
    }
  };

  /**
   * @returns {object} jsx for resource translations table cells
   */
  resourceTranslationTableCells = () => {
    const { resource } = this.props;

    return map(resource.translations, (t) => {
      let isGroupingResource = t.translation_group_id === null;

      return (
        <TableRow
          key={`translations_${t.id}`}
          style={{ cursor: "pointer" }}
          onClick={(e) => this.handleRowClick(e, t.id)}
          hover
        >
          <TableCell>{t.id}</TableCell>
          <TableCell align="right">
            {t.language.exonym}
            {isGroupingResource && <em> (grouping resource)</em>}
          </TableCell>
        </TableRow>
      );
    });
  };

  render() {
    const { classes, resource, resources, resourcesLoading, translationGroupResource } = this.props;
    const { selectedResource } = this.state;

    return (
      <div className={classes.translationGroupResourceContainer}>
        <div className={classes.translationGroupResourceHeader}>Resource Translation Group</div>

        {!this.isGroupingResource() && (
          <React.Fragment>
            <div className={classes.translationGroupResourceSubHeader}>
              If this resource is a translation of another, select that resource here.
            </div>

            <FormControl className={classes.searchTranslationContainer} variant="standard">
              <SearchBar
                ref={this.searchBarRef}
                label={"Search for Translation Group Resource"}
                onSelectItem={this.handleSelectResourceFromSearch}
                queryKey={"name"}
                resultsSource={resources}
                searchable={this.executeSearch}
                searching={resourcesLoading}
              />
            </FormControl>

            <FormControl className={classes.searchTranslationContainer} variant="standard">
              <Button
                aria-label="Add Item"
                color="primary"
                variant="contained"
                onClick={this.updateTranslationGroupResource}
                disabled={!selectedResource}
              >
                <AddIcon color="inherit" />
              </Button>
            </FormControl>

            {translationGroupResource && (
              <div>
                <div className={classes.translationGroupResourceSubHeaderText}>
                  Current translation group resource name:
                </div>

                <div className={classes.translationGroupResourceText}>
                  {translationGroupResource.name}
                  <ConfirmButton
                    className={classes.removeItemButton}
                    size="small"
                    color="primary"
                    onConfirm={() => this.unlinkFromGroupingResource()}
                    title="Are you sure you want to remove from this Grouping Resource?"
                    aria-label="Remove"
                    variant="text"
                    disabled={resourcesLoading}
                  >
                    <ClearIcon fontSize="small" />
                  </ConfirmButton>
                </div>
              </div>
            )}

            <div className={classes.translationGroupResourceDescription}>
              Resources will only be available for selection if they don't yet belong to a
              translation group, or if they are the grouping resource of a translation group. When
              an English version of a resource is available, use it as the grouping resource (i.e.,
              select it as the translation group from the non-English resources). Translation groups
              can only have one resource of a given language, so the available selections will also
              be limited to those of a different language than the current resource.
            </div>
          </React.Fragment>
        )}

        {this.isGroupingResource() && (
          <div className={classes.isGroupingResourceText}>
            This resource is the grouping resource for a resource translation group. To associate it
            with a different group, modify the other resources in this group so they no longer
            reference this as their grouping resource.
          </div>
        )}

        {!isEmpty(resource.translations) && (
          <div className={classes.translationGroupResourceHeader}>
            Other Resources in this group:
            <Table
              className={classes.table}
              size="small"
              aria-label="other Resources in this group"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Resource ID</TableCell>
                  <TableCell align="right">Language</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{this.resourceTranslationTableCells()}</TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }
}
const styles = (theme) => ({
  loadingCircularProgress: {
    marginTop: theme.spacing(2),
  },
  searchTranslationContainer: {
    marginBottom: theme.spacing(1),
    minWidth: 180,
    width: "100%",
  },
  isGroupingResourceText: {
    fontWeight: styleVars.txtFontWeightDefaultLight,
    marginBottom: theme.spacing(1),
    fontStyle: "italic",
  },
  removeItemButton: {
    float: "right",
    minWidth: "unset",
  },
  translationGroupResourceContainer: {
    marginBottom: theme.spacing(1),
  },
  translationGroupResourceSubHeader: {
    fontStyle: "italic",
    fontWeight: styleVars.txtFontWeightDefaultLight,
    marginBottom: theme.spacing(1.5),
  },
  translationGroupResourceSubHeaderText: {
    fontWeight: styleVars.txtFontWeightDefaultLight,
  },
  translationGroupResourceDescription: {
    fontSize: styleVars.txtFontSizeSm,
    fontStyle: "italic",
    fontWeight: styleVars.txtFontWeightDefaultLight,
    marginBottom: theme.spacing(1.5),
  },
  translationGroupResourceText: {
    margin: theme.spacing(0, 0, 1, 2),
  },
});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ResourceTranslationGroup));
