import React from "react";
import { capitalize } from "lodash";
import { Badge } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Badges",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

const storyOutput = (badgeVariant) => {
  const demoBadgeColors = ["error", "primary", "secondary"];

  return (
    <React.Fragment key={badgeVariant}>
      <div style={demoStyles.disclaimerBlock}>
        <p>
          <strong>Badge note:</strong> We can use any{" "}
          <a
            href="https://material-ui.com/components/material-icons/"
            target="_blank"
            rel="noopener noreferrer"
          >
            material-ui icons
          </a>{" "}
          for badges, in these examples we use the mail icon.
        </p>
      </div>
      {demoBadgeColors.map((badgeColor) => (
        <React.Fragment key={badgeVariant + badgeColor}>
          <section style={demoStyles.sectionStyle}>
            <h3>
              {capitalize(badgeVariant)} (color: {badgeColor})
            </h3>
            <div style={demoStyles.itemStyle}>
              <Badge variant={badgeVariant} badgeContent={4} color={badgeColor}>
                <MailIcon />
              </Badge>
            </div>
          </section>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export const Dot = () => storyOutput("dot");
export const Standard = () => storyOutput("standard");
