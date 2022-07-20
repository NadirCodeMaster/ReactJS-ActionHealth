import styleVars from "style/_vars.scss";
import unitlessNumber from "style/utils/unitlessNumber";

//
// Common values for PrimaryMenu and children.
//

// Apply to links when active.
// --
// You'll generally apply any other styles to the element via `sx`, then
// add `style={(isActive) => (isActive ? sxActiveLink : {})}` to have
// these styles applied only when link is actually active.
export const sxActiveLink = {
  backgroundColor: "rgba(0, 0, 0, 0.03)",
};

// Styles for the _admin_ <List> element.
// --
// Intended for use on its own; _not_ in combination with `sxList`.
export const sxAdminList = {
  backgroundColor: "#3A3834",
  marginTop: 1,
};

// Styles for <ListItem> in the admin submenu.
// --
// Intended for use on its own; _not_ in combination with `sxListItem`.
export const sxAdminListItem = {
  paddingLeft: 3,
};

// Styles for <ListItemText> in the admin submenu.
// --
// Intended for use on its own; _not_ in combination with `sxListItemText`.
export const sxAdminListItemText = {
  color: "#FFFFFF",
  fontSize: 12,
  paddingLeft: 1,
};

// Styles for top-level expansion toggle icons.
export const sxExpandCollapseIconsLevel1 = {
  left: unitlessNumber(styleVars.spacingUnit) * 0.25,
  marginTop: 1.25,
  position: "absolute",
  zIndex: 1,
};

// Styles for 2nd-level expansion toggle icons.
export const sxExpandCollapseIconsLevel2 = {
  left: unitlessNumber(styleVars.spacingUnit) * 1.5,
  marginTop: 1.25,
  position: "absolute",
  zIndex: 1,
};

// Styles for <List> elements.
export const sxList = {
  paddingBottom: 0,
  paddingTop: 0,
};

// Styles for <ListItemIcon> elements.
export const sxListItemIcon = {
  // ---
  // The two properties below can be used to vertically
  // center the icons. It's debatable whether that's better
  // or not, but it's likely to be requested at some point
  // so I'm leaving these here so we can quickly roll out
  // if needed.
  // alignSelf: 'flex-start',
  // paddingTop: theme.spacing(0.5)
  // ---
};

// Styles for top-level list items.
export const sxListItemLevel1 = {
  paddingLeft: 2.5,
  textDecoration: "none",
  "&:link, &:visited, &:hover, &:active, &:focus": {
    textDecoration: "none",
  },
};

// Styles for second-level list items.
export const sxListItemLevel2 = {
  paddingLeft: 4,
  textDecoration: "none",
  "&:link, &:visited, &:hover, &:active, &:focus": {
    textDecoration: "none",
  },
};

// Styles for third-level list items.
export const sxListItemLevel3 = {
  paddingLeft: 5,
  textDecoration: "none",
  "&:link, &:visited, &:hover, &:active, &:focus": {
    textDecoration: "none",
  },
};

// Styles for <ListItemText> elements.
export const sxListItemText = {
  color: styleVars.txtColorDefault,
  fontSize: 12,
  padding: 0,
  textTransform: "none",
};

// Styles for <ListItemText> expected to contain long text.
// --
// Primarily intended for assessments, which may have ridiculously long
// names relative to the size allowed here. Other elements that just
// incidentally have long text on occassion aren't candidates.
export const sxListItemTextLongTypography = {
  ...sxListItemText,
  fontSize: 12,
};

// Styles for <Divider>.
export const sxMenuDivider = {
  marginBottom: 1.5,
  marginTop: 1.5,
};
