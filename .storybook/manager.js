import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import hgTheme from './hgTheme';

addons.setConfig({
  theme: hgTheme,
  // isFullscreen: false,
  // showNav: true,
  // showPanel: true,
  // panelPosition: 'bottom',
  // sidebarAnimations: true,
  // enableShortcuts: true,
  // isToolshown: true,
  // theme: undefined,
  // selectedPanel: undefined,
  // initialActive: 'sidebar',
  // showRoots: false,
});
