/**
 * Add suffix to title add set it on document object
 *
 * @param {string} title
 *  Example: 'Assessment for Schools'
 */
export default function generateTitle(title) {
  const titleSuffix = 'Alliance for a Healthier Generation';
  let fullTitle = title ? title + ' | ' + titleSuffix : titleSuffix;
  document.title = fullTitle;
}
