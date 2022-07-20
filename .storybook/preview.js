import React from 'react';
import { ThemeProvider } from '@mui/core/styles';
import { withStyles } from '@mui/core/styles';
import muiTheme from '../src/theme.js';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import styleVars from '../src/style/_vars.scss';
import '../src/style/App.scss';
import unitlessNumber from '../src/style/utils/unitlessNumber';

const styles = muiTheme => ({});

const customViewports = {
  xs: { // @see styleVars.bpXs
    name: `P2 xs (0px to ${unitlessNumber(styleVars.bpSm) - 1}px)`,
    type: 'mobile',
    // Hard-coding a width for XS because the actual
    // minimum width for that BP is 0.
    styles: { height: '560px', width: '320px' },
  },
  sm: { // @see styleVars.bpSm
    name: `P2 sm (${styleVars.bpSm} to ${unitlessNumber(styleVars.bpMd) - 1}px)`,
    type: 'tablet',
    styles: { height: `${unitlessNumber(styleVars.bpSm)*1.75}px`, width: styleVars.bpSm },
  },
  md: { // @see styleVars.bpMd
    name: `P2 md (${styleVars.bpMd} to ${unitlessNumber(styleVars.bpLg) - 1}px)`,
    type: 'tablet',
    styles: { height: `${unitlessNumber(styleVars.bpMd)*1.75}px`, width: styleVars.bpMd },
  },
  lg: { // @see styleVars.bpLg
    name: `P2 lg (${styleVars.bpLg} to ${unitlessNumber(styleVars.bpXl) - 1}px)`,
    type: 'desktop',
    styles: { height: `${unitlessNumber(styleVars.bpLg)/1.75}px`, width: styleVars.bpLg },
  },
  xl: { // @see styleVars.bpXl
    name: `P2 xl (>=${styleVars.bpXl})`,
    type: 'desktop',
    styles: { height: `${unitlessNumber(styleVars.bpXl)/1.75}px`, width: styleVars.bpXl },
  },
};

export const parameters = {
  controls: { expanded: true },
  options: {
    // showPanel: true,
  },
  backgrounds: {
    default: 'P2 Body',
    values: [
      { name: 'P2 Body', value: muiTheme.palette.background.default },
      { name: 'P2 Paper', value: muiTheme.palette.background.paper },
    ],
  },
  viewport: {
    viewports: customViewports,
  },
};

export const decorators = [
  (Story) => <ThemeProvider theme={muiTheme}><Story /></ThemeProvider>
];
