import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Molecules/Cards",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Basic = () => (
  <Card>
    <CardContent>
      <p>Text in CardContent wrapped with a paragraph tag. {demoContent.demoParagraph}</p>
    </CardContent>
  </Card>
);

export const Typical = () => (
  <Card>
    <CardHeader title="CardHeader title" subheader="CardHeader subheader" />
    <CardContent>
      <p>Text in CardContent wrapped with a paragraph tag. {demoContent.demoParagraph}</p>
    </CardContent>
    <CardActions>
      <Button color="primary">Primary action</Button>
      <Button color="secondary">Secondary action</Button>
    </CardActions>
  </Card>
);
