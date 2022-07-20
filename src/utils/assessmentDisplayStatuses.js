/**
 * Return status display text based on percent complete for an assessment
 *
 * @param {number} percentComplete
 * @returns {object}
 */
export default function assessmentDisplayStatuses(percentComplete) {
  if (percentComplete === 0) {
    return {
      text: 'Not Started',
      button: 'Start'
    };
  }

  if (percentComplete > 0 && percentComplete < 1) {
    return {
      text: 'In Progress',
      button: 'Continue'
    };
  }

  if (percentComplete === 1) {
    return {
      text: 'Complete',
      button: 'View'
    };
  }
}
