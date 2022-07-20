import isAbsoluteUrl from 'utils/isAbsoluteUrl';

/**
 * Validate downloadable set URL.
 *
 * All this currently does is check if a string is valid
 * as an absolute URL.
 *
 * @param {string} downloadUrl
 * @return {boolean}
 */
export default function validDownloadableSetUrl(downloadUrl) {
  return isAbsoluteUrl(downloadUrl);
}
