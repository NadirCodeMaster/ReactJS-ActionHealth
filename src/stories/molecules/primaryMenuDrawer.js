import React, { Fragment } from "react";
import PrimaryMenuDrawer from "components/layout/PrimaryMenuDrawer"; // was globalmenu
import theme from "../../theme.js";

export default {
  title: "Molecules/PrimaryMenuDrawer",
  argTypes: {
    mobileOpen: {
      control: {
        type: "boolean",
        default: true,
      },
    },
    drawerToggle: {
      control: {
        type: "boolean",
        default: false,
      },
    },
  },
};

export const Menu = (args) => {
  const { mobileOpen, drawerToggle } = args;

  return (
    <Fragment>
      <PrimaryMenuDrawer mobileOpen={mobileOpen} drawerToggle={drawerToggle}>
        <div style={{ padding: theme.spacing(2) }}>
          PrimaryMenuDrawer is a wrapper for our sidebar menu. The content within the menu itself
          (like list items) is all custom.
        </div>
      </PrimaryMenuDrawer>
    </Fragment>
  );
};

Menu.args = {
  mobileOpen: true,
  drawerToggle: false,
};
