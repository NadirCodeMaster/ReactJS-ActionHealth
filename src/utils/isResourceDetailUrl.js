/**
 * Test if a string is a resource detail URL
 *
 * EX: https://healthiergeneration.org/app/resources/7 returns true
 *     https://fakeresource.org/1234 returns false
 *
 * @param {string}
 * @return {boolean}
 */
export default function isResourceDetailUrl(url) {
  let resourceDetailPath = document.location.origin + `/app/resources`;
  let regex = new RegExp(`^` + resourceDetailPath, 'g');

  return Boolean(url.match(regex));
}
