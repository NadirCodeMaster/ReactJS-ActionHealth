/**
 * Check if two hostname strings have the same second-level domain.
 *
 * @param string host1
 * @param string host2
 * @returns boolean
 */
export default function compareSecondLevelDomainsOfHostnames(host1, host2) {
  let host1Parts = host1.split('.');
  let host2Parts = host2.split('.');

  // Make sure split results are arrays with at least two items each.
  if (
    Array.isArray(host1Parts) &&
    host1Parts.length > 1 &&
    Array.isArray(host2Parts) &&
    host2Parts.length > 1
  ) {
    let host1Tld = host1Parts.pop();
    let host1Sld = host1Parts.pop();
    let host2Tld = host2Parts.pop();
    let host2Sld = host2Parts.pop();
    return host1Tld === host2Tld && host1Sld === host2Sld;
  }
  return false;
}
