/**
 * Determine if a section should be rendered in the preview.
 *
 * @param {object} docbuilderSection
 * @returns {bool}
 */
export default function sectionShouldShowInPreview(s) {
  return !s.is_meta;
}
