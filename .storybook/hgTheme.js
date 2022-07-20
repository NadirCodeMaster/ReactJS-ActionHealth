import { create } from '@storybook/theming/create';
import logo from '../src/images/logo.svg';

export default create({
  base: 'light',
  brandTitle: 'Healthier Generation',
  brandUrl: 'https://www.healthiergeneration.org',
  brandImage: logo,
});
