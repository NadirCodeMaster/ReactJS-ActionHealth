import React, { Fragment, useEffect, useState } from "react";
import { requestDenylist } from "lib/Docbuilder/requests.js";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import AdminRoute from "components/ui/AdminRoute";
import PageDocbuilder from "lib/Docbuilder/components/Admin/DocbuildersDetail.js";
import PageDocbuilders from "lib/Docbuilder/components/Admin/DocbuildersList.js";
import PageDocbuildersNew from "lib/Docbuilder/components/Admin/DocbuildersNew.js";
import PageDocbuildersSection from "lib/Docbuilder/components/Admin/SectionsDetail.js";
import PageDocbuildersSectionNew from "lib/Docbuilder/components/Admin/SectionsNew.js";
import PageDocbuildersSubSection from "lib/Docbuilder/components/Admin/SubsectionsDetail.js";
import PageDocbuildersSubSectionNew from "lib/Docbuilder/components/Admin/SubsectionsNew.js";
import PageDocbuildersQuestion from "lib/Docbuilder/components/Admin/QuestionsDetail.js";
import PageDocbuildersQuestionNew from "lib/Docbuilder/components/Admin/QuestionsNew.js";

/**
 * Docbuilder routing controller
 */
export default function DocbuilderController() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [denylist, setDenyList] = useState([]);
  const [denyListLoaded, setDenyListLoaded] = useState(false);

  useEffect(() => {
    requestDenylist().then((res) => {
      if (200 === res.status) {
        setDenyList(res.data);
        setDenyListLoaded(true);
      } else {
        console.error("An error occurred fetching denylist");
      }
    });
  }, []);

  return (
    <Fragment>
      {denyListLoaded && (
        <Fragment>
          <Switch>
            {/* DOCBUILDER LIST */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders"
              currentUser={currentUser}
              render={({ match }) => <PageDocbuilders />}
            />

            {/* DOCBUILDER NEW */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/new"
              currentUser={currentUser}
              render={({ match }) => <PageDocbuildersNew denylist={denylist} />}
            />

            {/* DOCBUILDER DETAIL */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuilder
                  denylist={denylist}
                  docbuilderId={Number(match.params.docbuilder_id)}
                />
              )}
            />

            {/* Redirect to docbuilder detail */}
            <Redirect
              exact
              from="/app/admin/docbuilders/:docbuilder_id/sections"
              to="/app/admin/docbuilders/:docbuilder_id"
            />

            {/* DOCBUILDER SECTIONS NEW */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id/sections/new"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuildersSectionNew
                  docbuilderId={Number(match.params.docbuilder_id)}
                  denylist={denylist}
                />
              )}
            />

            {/* DOCBUILDER SECTIONS DETAIL */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id/sections/:section_id"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuildersSection
                  docbuilderId={Number(match.params.docbuilder_id)}
                  sectionId={Number(match.params.section_id)}
                  denylist={denylist}
                />
              )}
            />

            {/* Redirect to docbuilder sections detail */}
            <Redirect
              exact
              from="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections"
              to="/app/admin/docbuilders/:docbuilder_id/sections/:section_id"
            />

            {/* DOCBUILDER SUBSECTIONS NEW */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections/new"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuildersSubSectionNew
                  docbuilderId={Number(match.params.docbuilder_id)}
                  sectionId={Number(match.params.section_id)}
                  denylist={denylist}
                />
              )}
            />

            {/* DOCBUILDER SUBSECTIONS DETAIL */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections/:subsection_id"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuildersSubSection
                  docbuilderId={Number(match.params.docbuilder_id)}
                  sectionId={Number(match.params.section_id)}
                  subsectionId={Number(match.params.subsection_id)}
                  denylist={denylist}
                />
              )}
            />

            {/* Redirect to docbuilder subsections detail */}
            <Redirect
              exact
              from="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections/:subsection_id/questions"
              to="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections/:subsection_id"
            />

            {/* DOCBUILDER QUESTIONS NEW */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections/:subsection_id/questions/new"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuildersQuestionNew
                  docbuilderId={Number(match.params.docbuilder_id)}
                  sectionId={Number(match.params.section_id)}
                  subsectionId={Number(match.params.subsection_id)}
                  denylist={denylist}
                />
              )}
            />

            {/* DOCBUILDER QUESTIONS DETAIL */}
            <AdminRoute
              exact
              path="/app/admin/docbuilders/:docbuilder_id/sections/:section_id/subsections/:subsection_id/questions/:question_id"
              currentUser={currentUser}
              render={({ match }) => (
                <PageDocbuildersQuestion
                  docbuilderId={Number(match.params.docbuilder_id)}
                  sectionId={Number(match.params.section_id)}
                  subsectionId={Number(match.params.subsection_id)}
                  questionId={Number(match.params.question_id)}
                  denylist={denylist}
                />
              )}
            />
          </Switch>
        </Fragment>
      )}
    </Fragment>
  );
}
