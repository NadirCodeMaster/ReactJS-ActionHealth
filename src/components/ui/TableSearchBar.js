import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import HgTextField from "components/ui/HgTextField";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { usePrevious } from "state-hooks";
import moment from "moment";
import { DatePicker } from "@mui/lab";
import { isNil, omitBy } from "lodash";

//
// Expandable search bar for tables.
//

function TableSearchBar({
  defaultSearchExpanded,
  fields,
  onClear,
  onChange,
  onSearch,
  search,
  searchBarText,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [disabled, setDisabled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Parent components that call TableSearchBar may set their 'search' object
  // in compoinentDidUpdate.  Because of this the initial defaultSearchExpanded
  // value could change once on initial update of parent component if search
  // params exist
  const prevDefaultSearchExpanded = usePrevious(defaultSearchExpanded);

  const theme = useTheme();
  const useFullWidthFields = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (defaultSearchExpanded !== prevDefaultSearchExpanded) {
      if (mounted.current) {
        setExpanded(defaultSearchExpanded);
      }
    }
  }, [defaultSearchExpanded, prevDefaultSearchExpanded]);

  const handleChangeAccordion = useCallback((e, isExpanded) => {
    e.preventDefault();
    if (mounted.current) {
      setExpanded(Boolean(isExpanded));
    }
  }, []);

  const handleClear = useCallback(
    (e) => {
      if (!isNil(onClear)) {
        onClear();
      }
    },
    [onClear]
  );

  const handleChangeSearch = useCallback(
    (e) => {
      search[e.target.name] = e.target.value;
      onChange(search);
    },
    [onChange, search]
  );

  const handleChangeDate = useCallback(
    (e, searchKey) => {
      if (!moment(e).isValid() && mounted.current) {
        setDisabled(true);
      } else if ((moment(e).isValid() || isNil(e)) && mounted.current) {
        setDisabled(false);
      }
      search[searchKey] = e;
      if (mounted.current) {
        onChange(search);
      }
    },
    [onChange, search]
  );

  const executeSearch = useCallback(
    (_, searchOverride) => {
      let finalSearch = searchOverride || search;
      onSearch(omitBy(finalSearch, (val) => val === ""));
    },
    [onSearch, search]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      executeSearch();
    },
    [executeSearch]
  );

  return (
    <Box sx={(theme) => ({ marginBottom: theme.spacing(1) })}>
      <Accordion onChange={handleChangeAccordion} expanded={expanded}>
        <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
          <Box sx={{ alignItems: "center", display: "flex" }}>
            <SearchIcon color="primary" />
            <Box component="span" sx={(theme) => ({ marginLeft: theme.spacing(0.5) })}>
              {searchBarText}
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <form onSubmit={handleSubmit}>
            <Box sx={sxSearch}>
              <Button
                sx={sxButton}
                color="primary"
                onClick={handleClear}
                variant="outlined"
                fullWidth={useFullWidthFields}
              >
                Clear
              </Button>
              {fields.map((field) => {
                if (field.type === "date") {
                  return (
                    <React.Fragment key={`tsb_field_${field.name}`}>
                      {/* @see https://mui.com/components/date-picker/ */}
                      <DatePicker
                        label={field.label}
                        inputFormat={"MM/DD/YYYY"}
                        id={`tsb_field_${field.name}`}
                        value={search[field.name] ? search[field.name] : null}
                        onChange={(e) => handleChangeDate(e, field.name)}
                        renderInput={(params) => (
                          <HgTextField
                            sx={sxSearchItem}
                            fullWidth={useFullWidthFields}
                            {...params}
                          />
                        )}
                      />
                    </React.Fragment>
                  );
                }

                return (
                  <HgTextField
                    key={`tsb_field_${field.name}`}
                    id={`tsb_field_${field.name}`}
                    sx={sxSearchItem}
                    label={field.label}
                    InputLabelProps={{
                      htmlFor: `${field.name}`,
                    }}
                    inputProps={{
                      id: `${field.name}`,
                    }}
                    name={field.name}
                    onChange={handleChangeSearch}
                    select={field.type === "select"}
                    {...((field.width || field.minWidth) && {
                      style: {
                        ...(field.minWidth && { minWidth: field.minWidth }),
                        ...(field.width && { width: field.width }),
                      },
                    })}
                    {...(field.type !== "select" && {
                      type: field.type || "text",
                    })}
                    value={
                      search[field.name]
                        ? field.parseInt
                          ? parseInt(search[field.name], 10)
                          : search[field.name]
                        : ""
                    }
                    variant="outlined"
                    fullWidth={useFullWidthFields}
                  >
                    {field.type === "select" && field.options}
                  </HgTextField>
                );
              })}
              <Button
                sx={sxButton}
                color="primary"
                onClick={executeSearch}
                variant="contained"
                type="submit"
                fullWidth={useFullWidthFields}
                disabled={disabled}
              >
                Search
              </Button>
            </Box>
          </form>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

const sxButton = (theme) => ({
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(),
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(),
  },
  lineHeight: 1,
});

const sxSearch = (theme) => ({
  display: "flex",
  justifyContent: "flex-start",
  flexWrap: "wrap",
  [theme.breakpoints.up("sm")]: {
    justifyContent: "flex-end",
  },
});

const sxSearchItem = (theme) => ({
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(),
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(),
  },
});

TableSearchBar.propTypes = {
  defaultSearchExpanded: PropTypes.bool,
  fields: PropTypes.arrayOf(PropTypes.object),
  onClear: PropTypes.func,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  search: PropTypes.object,
  searchBarText: PropTypes.string,
};

TableSearchBar.defaultProps = {
  searchBarText: "Search...",
};

export default TableSearchBar;
