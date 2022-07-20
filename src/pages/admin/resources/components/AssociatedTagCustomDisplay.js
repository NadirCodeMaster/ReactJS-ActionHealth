import React from 'react';
import { get } from 'lodash';

/**
 * Custom display for associated tags
 *
 * This was required mainly due to the added complexity of displaying
 * 'internal' text
 */

function AssociatedTagCustomDisplay({ item }) {
  let isInternal = get(item, 'internal', false);
  let itemName = get(item, 'name', '');

  return (
    <div>
      {itemName}
      {isInternal && <small> (internal)</small>}
    </div>
  );
}

export default AssociatedTagCustomDisplay;
