import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Hook that tracks if window is below a breakpoint.
 *
 * Ex:
 * ```
 * let isSmallerThanSmall = useWidthDown('sm');
 * ```
 *
 * @param {string} breakpoint
 *  One of the MUI breakpoint abbreviations ('xs'|'sm'|'md'|'lg'|'xl').
 * @returns {bool}
 */
export default function useIsWidthDown(breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
}
