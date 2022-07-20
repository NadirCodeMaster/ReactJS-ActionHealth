module.exports = {
  addons: [
    {
      name: '@storybook/preset-create-react-app',
    },
    {
      name: '@storybook/addon-essentials',
      options: {
        // Disabling items we're don't currently
        // utlizing to reduce confusion.
        actions: false,
        docs: false,
      },
    },
  ],
  stories: [
    // BRANDING
    '../src/stories/branding/colors.js',
    '../src/stories/branding/typography.js',
    '../src/stories/branding/styleVars.js',

    // ATOMS
    '../src/stories/atoms/alerts.js',
    '../src/stories/atoms/badges.js',
    '../src/stories/atoms/breadcrumbs.js',
    '../src/stories/atoms/buttons.js',
    '../src/stories/atoms/checkboxes.js',
    '../src/stories/atoms/chips.js',
    '../src/stories/atoms/circularProgress.js',
    '../src/stories/atoms/errors.js',
    '../src/stories/atoms/paper.js',
    '../src/stories/atoms/popups.js',
    '../src/stories/atoms/progressBar.js',
    '../src/stories/atoms/radios.js',
    '../src/stories/atoms/selects.js',
    '../src/stories/atoms/skeletons.js',
    '../src/stories/atoms/switches.js',
    '../src/stories/atoms/textFields.js',
    '../src/stories/atoms/tooltips.js',

    // MOLECULES
    '../src/stories/molecules/accordions.js',
    '../src/stories/molecules/confirmButtons.js',
    '../src/stories/molecules/ctaTemplateA.js',
    '../src/stories/molecules/cards.js',
    '../src/stories/molecules/draftEditors.js',
    '../src/stories/molecules/primaryMenuDrawer.js',
    '../src/stories/molecules/navLists.js',
    '../src/stories/molecules/paginatedWrappers.js',
    // '../src/stories/molecules/planItemCards.js', @TODO UPDATE
    '../src/stories/molecules/resourceCards.js',
    '../src/stories/molecules/searchBars.js',
    '../src/stories/atoms/tables.js',
    '../src/stories/molecules/tabs.js'
  ]
};
