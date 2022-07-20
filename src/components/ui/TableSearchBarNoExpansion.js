import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import HgTextField from "components/ui/HgTextField";
import moment from "moment";
import { Box, Button, Paper, useMediaQuery, useTheme } from "@mui/material";
import { DatePicker } from "@mui/lab";
import { isNil, omitBy } from "lodash";
import styleVars from "style/_vars.scss";

//
// Search bar for tables. (non-expandable)
//

function TableSearchBarNoExpansion({ fields, onClear, onChange, onSearch, search, searchBarText }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [disabled, setDisabled] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  const honorFieldWidth = useCallback(
    (field) => {
      return (field.width || field.minWidth) && !isSmallScreen;
    },
    [isSmallScreen]
  );

  return (
    <Paper
      sx={{
        pt: 2.5,
        pr: 2.5,
        pb: 2,
        pl: 2.5,
      }}
    >
      {searchBarText && (
        <Box
          sx={{
            fontSize: styleVars.txtFontSizeLg,
            mt: 0,
            mr: 0,
            mb: 1.5,
            ml: 0,
          }}
        >
          {searchBarText}
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <Box
          component="section"
          sx={(theme) => ({
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            [theme.breakpoints.up("sm")]: {
              justifyContent: "flex-end",
              flexWrap: "wrap",
            },
          })}
        >
          {fields.map((field) => {
            if (field.type === "date") {
              return (
                <React.Fragment key={`tsb_field_${field.name}`}>
                  <DatePicker
                    label={field.label}
                    inputFormat={"MM/DD/YYYY"}
                    id={`tsb_field_${field.name}`}
                    value={search[field.name] ? search[field.name] : null}
                    onChange={(e) => handleChangeDate(e, field.name)}
                    renderInput={(params) => (
                      <HgTextField
                        sx={sxSearchItem}
                        {...(honorFieldWidth(field) && {
                          style: {
                            ...(field.minWidth && { minWidth: field.minWidth }),
                            ...(field.width && { width: field.width }),
                          },
                        })}
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
                {...(honorFieldWidth(field) && {
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
                disabled={field.disabled}
              >
                {field.type === "select" && field.options}
              </HgTextField>
            );
          })}
          <Box sx={sxActionWrapper}>
            <Button
              sx={sxButton}
              color="primary"
              onClick={executeSearch}
              variant="contained"
              type="submit"
              disabled={disabled}
            >
              Search
            </Button>
            <Button sx={sxButton} color="primary" onClick={handleClear} variant="outlined">
              Clear
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
}

const sxActionWrapper = (theme) => ({
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    alignItems: "stretch",
    display: "flex",
    flex: "1 0 auto",
    justifyContent: "stretch",
    width: "unset",
  },
});

const sxButton = (theme) => ({
  width: "100%",
  mt: 0.5,
  mr: 0.5,
  mb: 1,
  ml: 0,
  [theme.breakpoints.up("sm")]: {
    flex: "1 0 auto",
    pt: 0.5,
    pb: 0.5,
    ml: 0.5,
    width: "unset",
  },
});

const sxSearchItem = (theme) => ({
  width: "100%",
  margin: theme.spacing(0.5, 0.5, 1, 0),
  [theme.breakpoints.up("sm")]: {
    margin: theme.spacing(0.5, 0.5, 1, 0.5),
    flex: "1 0 auto",
    width: "unset",
  },
});

TableSearchBarNoExpansion.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object),
  onClear: PropTypes.func,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  search: PropTypes.object,
  searchBarText: PropTypes.string,
};

TableSearchBarNoExpansion.defaultProps = {
  searchBarText: null,
};

export default TableSearchBarNoExpansion;
