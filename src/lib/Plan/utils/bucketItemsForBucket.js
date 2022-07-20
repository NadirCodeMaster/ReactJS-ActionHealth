import memoizee from 'memoizee';
import { forEach, sortBy } from 'lodash';
import { nullBucket } from './constants';

/**
 * Get sorted items for a bucket.
 *
 * @param {Number|String} bucketId
 *  Numeric ID or special faux ID like the null bucket ID.
 * @param {Array} itemsArr
 *  Array of plan item objects that will be searched through.
 * @returns {Array}
 */
export default memoizee((bucketId, itemsArr) => {
  let _bucketItems = [];

  // Handle non-numeric bucket IDs (faux buckets), standardize others.
  switch (bucketId) {
    case nullBucket.id:
      bucketId = null; // plan_bucket_ids will need to match this.
      break;
    default:
      bucketId = Number(bucketId);
  }

  forEach(itemsArr, item => {
    let _itemBID = item.plan_bucket_id ? Number(item.plan_bucket_id) : null;
    if (_itemBID === bucketId) {
      _bucketItems.push(item);
    }
  });

  let sorted = sortBy(_bucketItems, [
    function(obj) {
      return Number(obj.weight);
    }
  ]);
  return sorted;
});
