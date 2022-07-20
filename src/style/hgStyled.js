import { createStyled } from "@mui/system";
import muiTheme from "style/muiTheme";

/**
 * Replacement for MUI's styled().
 *
 * Use this in all places where you would otherwise call
 * one of MUI's `styled()` methods.
 *
 * This ensures the correct theme object is used. Without it,
 * it appears `withStyles()` must be used to wrap components
 * to make that happen, and even then it doesn't appear certain
 * that it will work correctly. Also, `withStyles()` is noted
 * as deprecated, so there's that.
 *
 * Anyhow, this is the most reliable strategy I've come up
 * with so far during the migration from MUI v4 to v5. -ak
 */
const hgStyled = createStyled({ defaultTheme: muiTheme });

export default hgStyled;
