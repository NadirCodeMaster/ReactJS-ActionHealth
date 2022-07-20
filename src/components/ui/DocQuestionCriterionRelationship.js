import React, { Component } from "react";

class DocQuestionCriterionRelationship extends Component {
  render() {
    return (
      <div>
        <p>
          Each question represents a single criterion, which is selected when creating the question
          and cannot be changed (to avoid disrupting existing responses). However, questions can be
          deleted as needed.
        </p>
        <p>
          Responses are stored relative to criteria. So, an organization that has responded to a
          question using a given criterion will have effectively responded to <em>all</em> questions
          (across all sets and all programs) representing that criterion.
        </p>
      </div>
    );
  }
}

export default DocQuestionCriterionRelationship;
