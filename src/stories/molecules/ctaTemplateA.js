import React, { Fragment } from "react";
import CtaTemplateA from "components/ui/CtaTemplateA";
import { Paper } from "@mui/material";
import medalImg from "images/medal.svg";
import * as demoStyles from "../_support/demoStyles";
import * as demoContent from "../_support/demoContent";
import theme from "../../theme.js";
import styleVars from "style/_vars.scss";

export default {
  title: "Molecules/CTA Template A",
  argTypes: {
    templateText: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the template",
      control: {
        type: "text",
      },
    },
    templateLinkText: {
      description:
        "This option is only for the styleguide demo. This option allows customized link text to see how it fills the template",
      control: {
        type: "text",
      },
    },
  },
};

const defaultTemplateText = demoContent.demoSentence;
const defaultTemplateLinkText = demoContent.demoShortSentence;

export const Image = (args) => {
  const { templateText, templateLinkText } = args;

  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <Paper style={{ padding: styleVars.paperPadding }}>
        <CtaTemplateA
          text={templateText}
          linkHref={
            "https://www.healthiergeneration.org/take-action/schools/national-healthy-schools-award"
          }
          linkText={templateLinkText}
          imgSrc={medalImg}
        />
      </Paper>
    </Fragment>
  );
};

Image.args = {
  templateText: defaultTemplateText,
  templateLinkText: defaultTemplateLinkText,
};

export const NoImage = (args) => {
  const { templateText, templateLinkText } = args;

  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <Paper style={{ padding: styleVars.paperPadding }}>
        <CtaTemplateA
          text={templateText}
          linkHref={
            "https://www.healthiergeneration.org/take-action/schools/national-healthy-schools-award"
          }
          linkText={templateLinkText}
        />
      </Paper>
    </Fragment>
  );
};

NoImage.args = {
  templateText: defaultTemplateText,
  templateLinkText: defaultTemplateLinkText,
};

const disclaimer = (
  <React.Fragment>
    <p>
      CTA templates can have text as well as images. This template is wrapped in a Paper element for
      clarity.
    </p>
  </React.Fragment>
);
