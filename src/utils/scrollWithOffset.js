/**
 * Improve scrolling to a hash destination.
 *
 * Causes the browser to scroll to `el` with vertical offset so you can see the
 * thing you wanted to scroll to.
 *
 * @see https://github.com/rafgraph/react-router-hash-link/issues/25#issuecomment-536688104
 *
 * @param {object} el Element you want to scroll to.
 */
export default function scrollWithOffset(el) {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -80;
  window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
}
