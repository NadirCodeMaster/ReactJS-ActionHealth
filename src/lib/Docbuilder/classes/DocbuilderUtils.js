import { get, includes, isArray } from "lodash";
import moment from "moment";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import TrophyIcon from "@mui/icons-material/EmojiEventsOutlined";

/**
 * Helper class for working with docbuilder objects.
 */
export default class DocbuilderUtils {
  /**
   * Filter an array of docbuilders to those available to a given org.
   *
   * @param {array|object} docbuilders
   * @param {array} organization
   * @param {bool} includeClosed
   *  If `true`, docbuilders where `closed=true` are included in results. This
   *  method relies on that property; it does _not_ calculate whether that
   *  property is still accurate. Default is `false`.
   * @returns {array}
   */
  static docbuildersForOrganization(docbuilders, organization, includeClosed = false) {
    let res = [];
    let dArr = [];
    if (docbuilders) {
      // Make sure we're working with an array.
      dArr = isArray(docbuilders) ? docbuilders : Object.values(docbuilders);
      // Loop thru them to find ones applicable to organization's type.
      for (const d of dArr) {
        if (includes(d.organization_types, organization.organization_type_id)) {
          // Only add public docbuilders. Omit closed docbuilders unless
          // caller requested them.
          let isClosed = get(d, "closed", false);
          if (d.public && (!isClosed || includeClosed)) {
            res.push(d);
          }
        }
      }
    }
    return res;
  }

  /**
   * Get icon component to represent a given docbuilder.
   *
   * @param {object} docbuilder
   * @returns {ReactElement}
   */
  static menuItemIcon(docbuilder) {
    switch (docbuilder.machine_name) {
      case "recognition_2022":
        return TrophyIcon;
      default:
        return DescriptionIcon;
    }
  }

  /**
   * Determine if a docbuilder is currently closed at time of call.
   *
   * Docbuilders from the API have a `closed` property, but that's calculated
   * by the server at the time of the request; therefore, it may become invalid.
   *
   * This method re-calculates what the `closed` property should currently be
   * based on the `closed_at` property. The new value is returned but the
   * provided docbuilder object is _not_ updated by this method.
   *
   * @param {object} docbuilder
   * @param {string|null} nowDatetimeUtc
   *  Optional parameter that allows setting what datetime is considered "now." When
   *  left as default of `null`, the current datetime is used. Otherwise, provide
   *  an ISO 8601 string that represents the desired "now" in UTC.
   * @returns {bool}
   */
  static calculateClosed(docbuilder, nowDatetimeUtc = null) {
    let closedAt = get(docbuilder, "closed_at", null); // timestamp (UTC) or null
    let newVal = false;

    // Can only be closed if closed_at is set.
    if (closedAt) {
      let nowObj = nowDatetimeUtc ? moment.utc(nowDatetimeUtc) : moment.utc();
      let closedAtObj = moment.utc(closedAt);
      // If now is after closedAt, docbuilder is closed.
      newVal = nowObj.isAfter(closedAtObj);
    }
    return newVal;
  }

  /**
   * Get milliseconds until a docbuilder is to be closed.
   *
   * @param {object} docbuilder
   * @param {integer} buffer Milliseconds to be subtracted from the actual
   *  number of milliseconds before returning. This is to help keep the client-side
   *  code ahead of the server-side, so users are less likely end up submitting
   *  just after the server has closed a docbuilder.
   * @param {string|null} nowDatetimeUtc
   *  Optional parameter that allows setting what datetime is considered "now." When
   *  left as default of `null`, the current datetime is used. Otherwise, provide
   *  an ISO 8601 string that represents the desired "now" in UTC.
   * @returns {integer}
   *  If docbuilder is to close at some time in the future, the value returned
   *  will be the milliseconds until that time (minus some buffer). Otherwise:
   *  `0` is returned for already closed docbuilders, `-1` is returned for
   *  docbuilders that do not close.
   */
  static calculateTimeUntilClosed(docbuilder, buffer = 5000, nowDatetimeUtc = null) {
    let res = -1; // default to non-closing.
    let closedAt = get(docbuilder, "closed_at", null); // timestamp (UTC) or null

    if (closedAt) {
      let closedAtTimestamp = moment.utc(closedAt).valueOf();

      let nowObj = nowDatetimeUtc ? moment.utc(nowDatetimeUtc) : moment.utc();
      let nowTimestamp = nowObj.valueOf();

      let diff = closedAtTimestamp - buffer - nowTimestamp;
      res = diff > 0 ? diff : 0;
    }

    return res;
  }
}
