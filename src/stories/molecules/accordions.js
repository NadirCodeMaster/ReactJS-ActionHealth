import React from "react";
import {
  Button,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Molecules/Accordions",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Simple = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonAccordionDisclaimer}</div>
    <div style={demoStyles.itemStyle}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Accordion summary pellentesque turpis quis
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
          sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Accordion summary lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
          sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Accordion summary eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut
          aliquet dui. Cras vitae tortor sit amet nulla dignissim fringilla in non augue.
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
          sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion disabled>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Accordion summary (disabled) eu purus justo
        </AccordionSummary>
      </Accordion>
    </div>
  </React.Fragment>
);

export const Grouped = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonAccordionDisclaimer}</div>
    <div style={demoStyles.itemStyle}>
      <Accordion style={{ marginBottom: 0 }} defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Grouped Accordion 1</AccordionSummary>
        <AccordionDetails>
          The only implementation difference between these "Grouped" Expansion Panels and the others
          is that we removed the margin so they stick together when expanded.
        </AccordionDetails>
      </Accordion>
      <Accordion style={{ margin: 0 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Grouped Accordion 2</AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
          sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion style={{ margin: 0 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Grouped Accordion 3</AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
          sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
    </div>
  </React.Fragment>
);

export const WithActions = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonAccordionDisclaimer}</div>
    <div style={demoStyles.itemStyle}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Accordion w/Actions</AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
          sit amet blandit leo lobortis eget.
        </AccordionDetails>
        <Divider />
        <AccordionActions>
          <Button size="small">Cancel</Button>
          <Button size="small" color="primary">
            Save
          </Button>
        </AccordionActions>
      </Accordion>
    </div>
  </React.Fragment>
);

// -------------------
// Supporting elements
// -------------------

const commonAccordionDisclaimer = (
  <p>
    <strong>Accordion note:</strong> When using the <code>Accordion</code> component, wrap that code
    with an HTML element that includes nothing but the Accordion(s). A plain <code>div</code> is
    fine. This allows the <code>:first-child</code> and <code>:last-child</code> pseudo-classes to
    apply styles that improve the display.
  </p>
);
