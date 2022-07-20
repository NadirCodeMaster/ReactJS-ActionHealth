import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import SearchBar from "components/ui/SearchBar";
import { requestCriteria } from "api/requests";

//
// Form element for searching and selecting the Criterion to associate w/
// new criterion instances.
//
export default function CriterionSelector({ onSelectItem }) {
  const searchBarRef = useRef(null);
  const [criteriaSearchResults, setCriteriaSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  /**
   * Submit search to API.
   */
  const executeSearch = useCallback(
    (search) => {
      setSearching(true);
      requestCriteria({
        per_page: 50,
        ...search,
      })
        .then((res) => {
          setCriteriaSearchResults(res.data.data);
          setSearching(false);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [setCriteriaSearchResults, setSearching]
  );

  return (
    <SearchBar
      ref={searchBarRef}
      label={"Search criteria by name"}
      onSelectItem={onSelectItem}
      queryKey={"name"}
      resultsSource={criteriaSearchResults}
      searchable={executeSearch}
      searching={searching}
    />
  );
}

CriterionSelector.propTypes = {
  onSelectItem: PropTypes.func.isRequired,
};
