/**
 * Test if a string qualifies as a root-relative path.
 *
 * Which mostly just means we check if it starts with "/".
 *
 * @param {string} str
 * @return {boolean}
 */
export default function isRootRelativePath(str) {
  // @TODO Better regex?
  const regex = new RegExp(/^\//gi);

  return Boolean(str.match(regex));
}
