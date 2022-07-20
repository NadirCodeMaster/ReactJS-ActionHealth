import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { filter, find, isNil, sortBy } from 'lodash';
import memoizee from 'memoizee';

//
// Lists CIs by Set, Module.
// -------------------------
// Intended for CIs representing a single Criterion for a given organization, but
// since the CIs are to be provided by the caller, it may not make a difference.
//

export default function CriterionInstancesBlock({
  criterionInstances,
  headerTagLevel,
  headerText,
  organizationId,
  orgSetsData,
  userCanViewAssessment
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // NOTE! This component assumes the orgSetsData array is pre-sorted according
  // our standard business logic. As of this writing, it's provided to us like
  // that via the API.

  // Output content will be used in our JSX.
  // ex:
  // [
  //   {
  //     setId: 1,
  //     setName: 'My set',
  //     setAbbreviation: 'MS',
  //     programId: 8888,
  //     listItems: [
  //       {criterionInstanceId: 20, moduleId: 300, moduleName: 'My module'},
  //       {criterionInstanceId: 21, moduleId: 301, moduleName: 'My other module'}
  //     ]
  //   },
  //   {
  //     setId: 2,
  //     setName: 'My other set',
  //     setAbbreviation: 'MOS',
  //     programId: 9999,
  //     listItems: [
  //       {criterionInstanceId: 22, moduleId: 302, moduleName: 'My super module'},
  //       {criterionInstanceId: 23, moduleId: 303, moduleName: 'My great module'}
  //     ]
  //   }
  // ]
  const [content, setContent] = useState([]);

  const [HeaderTag, setHeaderTag] = useState('h3');

  // Set header tag.
  useEffect(() => {
    let newHeaderTag = 'h3';
    if (headerTagLevel) {
      let cast = parseInt(headerTagLevel, 10);
      newHeaderTag = `h${cast}`;
    }
    setHeaderTag(newHeaderTag);
  }, [headerTagLevel]);

  // Assemble content
  // ----------------
  useEffect(() => {
    let newContent = [];
    let listItemInSetStructure = {
      criterionInstanceId: null,
      moduleId: null,
      moduleName: null
    };

    // Loop thru orgSetsData to compile the list so we maintain the
    // correct sorting.
    for (let i = 0; i < orgSetsData.length; i++) {
      let _set = orgSetsData[i];
      let listItemsForSet = [];

      // Look for Qs with that set. And while looping, grab any non-module q's.
      let inSetWithoutModule = [];
      let inSetWithModule = filter(criterionInstances, q => {
        // The non-module check...
        if (isNil(q.module_id)) {
          inSetWithoutModule.push(q);
          return false;
        }
        // The actual filtering.
        return (q.set_id = _set.id);
      });
      // Add sorted non-module questions to our array of items in this set.
      inSetWithoutModule = sortBy(inSetWithoutModule, [
        function(q) {
          return q.weight;
        }
      ]);
      // Turn that into an array of list items.
      inSetWithoutModule = inSetWithoutModule.map(q => {
        return {
          ...listItemInSetStructure,
          criterionInstanceId: q.id,
          moduleName: 'Standard' // Edge case, so this should suffice
        };
      });
      listItemsForSet.push(...inSetWithoutModule);

      // Loop thru the set's modules grabbing associated questions so
      // we have them sorted correctly. (if we looped thru q's, they wouldn't
      // be sorted correctly)
      // let sortedWithModule = [];
      let qtyMatchedToModule = 0; // so we can bail asap
      for (let i2 = 0; i2 < _set.modules.length; i2++) {
        // If we've already matched all the available to questions to modules,
        // we can break out of the loop.
        // Note: Should never be more than one instance of a criterion in a
        // module. But if there is, we're going to ignore it.
        if (qtyMatchedToModule === _set.modules.length) {
          break;
        }
        // Otherwise, proceed with searching for a match.
        let matchingQ = find(inSetWithModule, q => {
          return q.module_id === _set.modules[i2].id;
        });
        if (matchingQ) {
          listItemsForSet.push({
            ...listItemInSetStructure,
            criterionInstanceId: matchingQ.id,
            moduleId: _set.modules[i2].id,
            moduleName: _set.modules[i2].name
          });
          qtyMatchedToModule++;
        }
      }
      // Add items from our set to content.
      if (listItemsForSet.length > 0) {
        newContent.push({
          programId: _set.program_id,
          setId: _set.id,
          setName: _set.name,
          setAbbreviation: _set.abbreviation.toUpperCase(),
          listItems: listItemsForSet
        });
      }
    }
    setContent(newContent);
  }, [criterionInstances, orgSetsData]);

  return (
    <Fragment>
      {userCanViewAssessment && content.length > 0 && (
        <Fragment>
          {headerText && <HeaderTag>{headerText}</HeaderTag>}
          <ul>
            {content.map(s => (
              <li key={`set_${s.setId}`}>
                <strong>
                  <Link to={pathToSet(s.programId, s.setId, organizationId)}>
                    {s.setAbbreviation}
                  </Link>
                </strong>
                <ul>
                  {s.listItems.map(li => (
                    <li key={`ci_${li.criterionInstanceId}`}>
                      <Link
                        to={pathToCi(s.programId, s.setId, organizationId, li.criterionInstanceId)}
                      >
                        {li.moduleName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Fragment>
      )}
    </Fragment>
  );
}

const pathToCi = memoizee((programId, setId, orgId, ciId) => {
  return `/app/programs/${programId}/organizations/${orgId}/sets/${setId}/questions/${ciId}`;
});
const pathToSet = memoizee((programId, setId, orgId) => {
  return `/app/programs/${programId}/organizations/${orgId}/sets/${setId}`;
});

CriterionInstancesBlock.propTypes = {
  criterionInstances: PropTypes.array.isRequired,
  headerText: PropTypes.string,
  headerTagLevel: PropTypes.number,
  organizationId: PropTypes.number.isRequired,
  orgSetsData: PropTypes.array.isRequired,
  userCanViewAssessment: PropTypes.bool.isRequired
};
