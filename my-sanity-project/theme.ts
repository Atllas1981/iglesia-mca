import { buildLegacyTheme } from 'sanity';

const props = {
  '--my-white': '#ffffff',
  '--my-black': '#0f172a',
  '--my-brand': '#0d2137',
  '--my-secondary': '#1a5f7a',
  '--my-accent': '#fdda24',
  '--my-red': '#ef4444',
  '--my-green': '#10b981',
  '--my-yellow': '#f59e0b',
};

export const myTheme = buildLegacyTheme({
  /* Base theme colors */
  '--black': props['--my-black'],
  '--white': props['--my-white'],

  '--gray': '#64748b',
  '--gray-base': '#64748b',

  '--component-bg': props['--my-white'],
  '--component-text-color': props['--my-black'],

  /* Brand */
  '--brand-primary': props['--my-brand'],

  /* Default button */
  '--default-button-color': '#64748b',
  '--default-button-primary-color': props['--my-brand'],
  '--default-button-success-color': props['--my-green'],
  '--default-button-warning-color': props['--my-yellow'],
  '--default-button-danger-color': props['--my-red'],

  /* State */
  '--state-info-color': props['--my-secondary'],
  '--state-success-color': props['--my-green'],
  '--state-warning-color': props['--my-yellow'],
  '--state-danger-color': props['--my-red'],

  /* Navbar */
  '--main-navigation-color': props['--my-black'],
  '--main-navigation-color--inverted': props['--my-white'],

  '--focus-color': props['--my-accent'],
});
