/**
 * Test if a string qualifies as a valid absolute URL.
 * @param {string} str
 * @return {boolean}
 */
export default function isAbsoluteUrl(str) {
  // https://bit.ly/2GhVAky
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);

  return Boolean(String(str).match(regex));
}
