import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEmpty, sortBy } from "lodash";
import { CircularProgress, Collapse } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import DraftEditor from "components/ui/DraftEditor";
import { requestTerms } from "api/requests";
import draftEditorTextIsEmpty from "utils/draftEditorTextIsEmpty";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

class SetGlossary extends Component {
  static propTypes = {
    set: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    program: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      terms: null,
      termsLoading: false,
      termsError: false,
    };
  }

  componentDidMount() {
    generateTitle("Glossary");
    this.getSetTerms();
  }

  componentDidUpdate(prevProps) {
    generateTitle("Glossary");
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  getSetTerms = () => {
    const { set } = this.props;

    this.setState({ termsLoading: true });

    requestTerms({
      set_id: set.id,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let terms = res.data.data;
          let sortedTerms = sortBy(terms, ["name", "id"]);
          this.setState({
            terms: sortedTerms,
            termsLoading: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            terms: [],
            termsLoading: false,
          });
          console.error("An error occurred retrieving terms.");
        }
      });
  };

  handleSourceClick = (e, termId) => {
    let sourceKey = "source_" + termId;

    if (sourceKey in this.state) {
      this.setState((prevState) => ({ [sourceKey]: !prevState[sourceKey] }));
    } else {
      this.setState({ [sourceKey]: true });
    }
  };

  render() {
    const { classes, organization, program, set } = this.props;
    const { terms, termsLoading } = this.state;
    let hasTerms = !isEmpty(terms);

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb root path={`/app/programs/${program.id}/organizations/${organization.id}`}>
            {organization.name}
          </Breadcrumb>
          <Breadcrumb
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}`}
          >
            {set.name}
          </Breadcrumb>
          <Breadcrumb
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/glossary`}
          >
            Glossary
          </Breadcrumb>
        </Breadcrumbs>

        {/* PAGE TITLE ETC */}
        <h1>Glossary</h1>
        <p>
          {set.name} glossary for {organization.name}.
        </p>

        {termsLoading && <CircularProgress />}

        {!hasTerms && !termsLoading && <p>No terms for this set</p>}

        {hasTerms && !termsLoading && (
          <dl>
            {terms.map((term, index) => {
              let sourceClickHandler = "source_" + index;
              let stateSourceClickHandler = this.state[sourceClickHandler];

              return (
                <div key={`term_${index}`} className={classes.termEntry}>
                  <dt className={classes.termNameDt}>{term.name}</dt>
                  {term.definition && (
                    <dd className={classes.termDefDd}>
                      <DraftEditor value={term.definition} readOnly={true} />
                    </dd>
                  )}
                  {term.source && !draftEditorTextIsEmpty(term.source) && (
                    <dd className={classes.termSourceDd}>
                      <span
                        onClick={(e) => this.handleSourceClick(e, index)}
                        className={classes.expandSource}
                      >
                        Source
                      </span>
                      <Collapse in={stateSourceClickHandler ? stateSourceClickHandler : false}>
                        <DraftEditor readOnly={true} value={term.source} />
                      </Collapse>
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  termEntry: {
    marginBottom: theme.spacing(4),
  },
  termNameDt: {},
  termDefDd: {},
  termSourceDd: {},
  expandSource: {
    color: styleVars.colorPrimary,
    cursor: "pointer",
  },
});

export default withStyles(styles, { withTheme: true })(SetGlossary);
