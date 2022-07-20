/**
 * Test if a string qualifies as a valid url slug
 *
 * EX: alliance-for-a-healthier-generation
 * lowercase letter and dashes only.
 *
 * @param {string} str
 * @return {boolean}
 */
export default function isUrlSlug(str) {
  const regex = new RegExp(/^[a-z](-?[a-z])*$/);

  return Boolean(str.match(regex));
}
