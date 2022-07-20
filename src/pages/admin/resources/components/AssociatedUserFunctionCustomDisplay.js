import React from 'react';
import { get } from 'lodash';

/**
 * Custom display for associated use functions
 *
 * This was required mainly due to the added complexity of different
 * user functions can have the same name, so they must be differentiated
 * by user function category
 *
 * https://github.com/alliance/cms/issues/3730#issuecomment-926909038
 */
export default function AssociatedUserFunctionCustomDisplay({ item }) {
  const itemName = get(item, 'name', '');
  const userFunctionCategoryName = get(item, 'user_function_category_name', '');
  const organizationTypeName = get(item, 'organization_type_name');

  return (
    <div>
      {organizationTypeName} | {userFunctionCategoryName}: {itemName}
    </div>
  );
}
