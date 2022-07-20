/**
 * Extract the hostname from a URL.
 *
 * @param String url
 * @return String
 */
export default function extractDomainFromUrlString(url) {
  // Adapted from https://stackoverflow.com/a/35222901
  // (does not work in IE < 11)
  var hostname = new URL(url).hostname;
  return hostname;
}
