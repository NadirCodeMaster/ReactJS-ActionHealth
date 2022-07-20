import React, { Fragment } from "react";
import SearchBar from "components/ui/SearchBar";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Molecules/Search Bar",
};

export const Search = (args) => {
  const searchBarRef = React.createRef();

  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <div
        styles={{
          minWidth: 180,
          width: "100%",
        }}
      >
        <SearchBar
          ref={searchBarRef}
          label={"Search"}
          onSelectItem={() => {}}
          queryKey={"name"}
          resultsSource={resultsSource}
          searchable={() => {}}
          searching={false}
        />
      </div>
    </Fragment>
  );
};

const disclaimer = (
  <React.Fragment>
    <p>This is a demo search bar, not hooked up to anything or fully functional</p>
  </React.Fragment>
);

const resultsSource = [
  {
    id: 713,
    name: "Conozca los datos acerca del coronavirus",
  },
  {
    id: 408,
    name: "Desayunos saludables y rápidos para la casa o para llevar",
  },
  {
    id: 965,
    name: "Hable con sus hijos adolescentes sobre los cigarrillos electrónicos (e-cigarrillos): Hoja con consejos para los padres",
  },
];
