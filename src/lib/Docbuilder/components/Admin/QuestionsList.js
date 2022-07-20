import React, { Fragment, useState, useEffect } from "react";
import { find, get, isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { requestQuestions } from "../../requests";
import { Link } from "react-router-dom";
import { Table, TableBody, TableHead, TableRow, TableCell } from "@mui/material";
import { makeStyles } from "@mui/styles";
import HgSkeleton from "components/ui/HgSkeleton";
import styleVars from "style/_vars.scss";

/**
 * Docbuilder questions list component
 */
export default function DocbuildersQuestions({ docbuilderId, sectionId, subsectionId }) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const classes = useStyles();
  const docbuilderQuestionTypes = useSelector(
    (state) => state.app_meta.data.docbuilderQuestionTypes
  );

  // Did docbuilders request return populated question array
  const hasQuestions = () => {
    return !isEmpty(questions) && loaded && !loading;
  };

  const questionTypeText = (id) => {
    return get(find(docbuilderQuestionTypes, { id }), "name", "");
  };

  // Request docbuilders from API
  useEffect(() => {
    setLoading(true);
    requestQuestions({
      docbuilder_subsection_id: subsectionId,
    }).then((res) => {
      if (200 === res.status) {
        setQuestions(res.data.data);
        setLoading(false);
        setLoaded(true);
      } else {
        console.error("An error occurred retrieving sections");
        setQuestions([]);
        setLoading(false);
        setLoaded(true);
      }
    });
  }, [subsectionId]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Question Type</TableCell>
          <TableCell align="right">Required</TableCell>
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
            {!hasQuestions() && (
              <TableRow>
                <TableCell colSpan={2}>No Questions Found</TableCell>
              </TableRow>
            )}
          </Fragment>
        )}
        {hasQuestions() && (
          <Fragment>
            {questions.map((question) => (
              <TableRow key={`docbuilder_${question.id}`}>
                <TableCell className={classes.longTableCell}>
                  <div>
                    <Link
                      to={`/app/admin/docbuilders/${docbuilderId}/sections/${sectionId}/subsections/${subsectionId}/questions/${question.id}`}
                    >
                      {question.id}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className={classes.secondaryText}>
                  {questionTypeText(question.docbuilder_question_type_id)}
                </TableCell>
                <TableCell align="right">{question.required ? "Yes" : "No"}</TableCell>
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
