import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Hook that tracks if window is at or above a breakpoint.
 *
 * Ex:
 * ```
 * let isLargerThanSmall = useWidthUp('sm');
 * ```
 *
 * @param {string} breakpoint
 *  One of the MUI breakpoint abbreviations ('xs'|'sm'|'md'|'lg'|'xl').
 * @returns {bool}
 */
export default function useIsWidthUp(breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}
