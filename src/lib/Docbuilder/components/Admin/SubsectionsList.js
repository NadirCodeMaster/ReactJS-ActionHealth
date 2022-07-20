import React, { Fragment, useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { requestSubsections } from "../../requests";
import { Link } from "react-router-dom";
import { Table, TableBody, TableHead, TableRow, TableCell } from "@mui/material";
import { makeStyles } from "@mui/styles";
import HgSkeleton from "components/ui/HgSkeleton";
import styleVars from "style/_vars.scss";

/**
 * Docbuilder subsections list component
 */
export default function DocbuildersSubsections({ docbuilderId, sectionId }) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [subsections, setSubsections] = useState([]);
  const classes = useStyles();

  // Did docbuilders request return populated log array
  const hasSubsections = () => {
    return !isEmpty(subsections) && loaded && !loading;
  };

  // Request docbuilders from API
  useEffect(() => {
    setLoading(true);
    requestSubsections({
      docbuilder_id: docbuilderId,
      docbuilder_section_id: sectionId,
    }).then((res) => {
      if (200 === res.status) {
        setSubsections(res.data.data);
        setLoading(false);
        setLoaded(true);
      } else {
        console.error("An error occurred retrieving subsections");
        setSubsections([]);
        setLoading(false);
        setLoaded(true);
      }
    });
  }, [docbuilderId, sectionId]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align="right">ID</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {loading && (
          <TableRow>
            <TableCell>
              <HgSkeleton variant="text" />
            </TableCell>
            <TableCell>
              <HgSkeleton variant="text" />
            </TableCell>
          </TableRow>
        )}
        {!loading && loaded && (
          <Fragment>
            {!hasSubsections() && (
              <TableRow>
                <TableCell colSpan={2}>No Subsections Found</TableCell>
              </TableRow>
            )}
          </Fragment>
        )}
        {hasSubsections() && (
          <Fragment>
            {subsections.map((subsection) => (
              <TableRow key={`docbuilder_${subsection.id}`}>
                <TableCell className={classes.longTableCell}>
                  <div>
                    <Link
                      to={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsection.id}`}
                    >
                      {subsection.builder_headline}
                    </Link>
                  </div>
                  <div className={classes.secondaryText}>{subsection.machine_name}</div>
                  <div className={classes.secondaryText}>{subsection.required}</div>
                </TableCell>
                <TableCell align="right">
                  <Link
                    to={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsection.id}`}
                  >
                    {subsection.id}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </Fragment>
        )}
      </TableBody>
    </Table>
  );
}

const useStyles = makeStyles((theme) => ({
  addButton: {
    marginLeft: "4px",
    minWidth: "auto",
  },
  secondaryText: {
    fontSize: styleVars.txtFontSizeXs,
  },
}));
