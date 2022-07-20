import React, { Fragment, useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { requestSections } from "../../requests";
import { Link } from "react-router-dom";
import { Table, TableBody, TableHead, TableRow, TableCell } from "@mui/material";
import { makeStyles } from "@mui/styles";
import HgSkeleton from "components/ui/HgSkeleton";
import styleVars from "style/_vars.scss";

/**
 * Docbuilder sections list component
 */
export default function DocbuildersSections({ docbuilderId }) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sections, setSections] = useState([]);
  const classes = useStyles();

  // Did docbuilders request return populated log array
  const hasSections = () => {
    return !isEmpty(sections) && loaded && !loading;
  };

  // Request sections from API
  useEffect(() => {
    setLoading(true);
    requestSections({
      docbuilder_id: docbuilderId,
    }).then((res) => {
      if (200 === res.status) {
        setSections(res.data.data);
        setLoading(false);
        setLoaded(true);
      } else {
        console.error("An error occurred retrieving sections");
        setSections([]);
        setLoading(false);
        setLoaded(true);
      }
    });
  }, [docbuilderId]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align="right">Meta</TableCell>
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
            <TableCell>
              <HgSkeleton variant="text" />
            </TableCell>
          </TableRow>
        )}
        {!loading && loaded && (
          <Fragment>
            {!hasSections() && (
              <TableRow>
                <TableCell colSpan={2}>No Sections Found</TableCell>
              </TableRow>
            )}
          </Fragment>
        )}
        {hasSections() && (
          <Fragment>
            {sections.map((section, index) => (
              <TableRow key={`section_${index}_${section.id}`}>
                <TableCell className={classes.longTableCell}>
                  <div>
                    <Link to={`/app/admin/docbuilders/${docbuilderId}/sections/${section.id}`}>
                      {section.builder_headline}
                    </Link>
                  </div>
                  <div className={classes.secondaryText}>{section.doc_headline}</div>
                  <div className={classes.secondaryText}>{section.machine_name}</div>
                  <div className={classes.secondaryText}>{section.slug}</div>
                </TableCell>
                <TableCell align="right">{section.is_meta ? "yes" : "no"}</TableCell>
                <TableCell align="right">
                  <Link to={`/app/admin/docbuilders/${docbuilderId}/sections/${section.id}`}>
                    {section.id}
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
