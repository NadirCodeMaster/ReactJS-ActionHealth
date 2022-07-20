import React from 'react';
import { get, isNil } from 'lodash';
import logoFoodAccess from 'images/program-branding/food_access.svg';
import logoQuickstart from 'images/program-branding/quickstart.svg';
import logoRise from 'images/program-branding/rise.svg';
import logoSts from 'images/program-branding/sts.svg';

const pbMap = {
  // Key by program machine name.
  food_access: {
    attrAlt: "Campbell's",
    attrSrc: logoFoodAccess
  },
  quickstart: {
    attrAlt: 'Quick Start',
    attrSrc: logoQuickstart
  },
  rise: {
    attrAlt: 'Resilience in School Environments',
    attrSrc: logoRise
  },
  sts: {
    attrAlt: 'Washington Office of Superintendent of Public Instruction',
    attrSrc: logoSts
  }
};

/**
 * Provides branding display shown below content on pages in a given Program.
 *
 * @param {string} programMachineName
 *  Machine name of program we want to get branding for.
 * @returns {Object|null}
 */
export default function programBranding(programMachineName, customStyles) {
  // No program, no branding.
  if (!programMachineName) {
    return null;
  }

  // If we don't have branding info for specified program,
  // there's nothing to do.
  let progData = get(pbMap, programMachineName, null);
  if (!progData) {
    return null;
  }

  // Setting a default style to be used if no custom style is provided
  let containerStyle = {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end'
  };

  if (!isNil(customStyles)) {
    containerStyle = customStyles;
  }

  return (
    <div className="program-branding" style={containerStyle}>
      <span className="program-branding__logo">
        <img
          alt={progData.attrAlt}
          className="program-branding__logo-img"
          src={progData.attrSrc}
          style={{ height: 'auto', width: '240px' }}
        />
      </span>
    </div>
  );
}
