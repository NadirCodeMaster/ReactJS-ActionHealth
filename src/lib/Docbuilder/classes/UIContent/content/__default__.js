// Default UI content for Docbuilders.
//
// @see https://app.gitbook.com/o/-MHv4uz-GMrpAd4x7tRz/s/-MHv4z6tEuRl9lAiab0P/products/programs2-overview/docbuilder/ui-customizations

const __default__ = {
  // Note: Keep top-level properties (slot names) sorted alphabetically
  // to keep this manageable.

  // --
  // Build page footer text. Is rendered fine-print style.
  // Originally for showing CDC attribution text on the WPB.
  build_page_footer: {
    "***": "",
  },

  // --
  // Short message displayed in various locations when the current docbuidler
  // is closed. Use to explain that changes/submissions are no longer accepted.
  // Only applicable to closable docbuilders (those with a non-null closed_at
  // property) and only only used when closed. Plain-text only.
  closed_message: {
    "***": "This form is now closed. Changes and submissions are no longer being accepted.",
  },

  // --
  // Primary body content of final download/submit modal above buttons.
  final_content_primary: {
    "nn*":
      "<p>Sorry! Looks like we need more information.</p> <p>Answer all of the questions and it'll be available for download. In the meantime, use the Preview to review your progress.</p>",
    "ny*":
      "<p>Good job!</p> <p>You've answered all of the questions and can download your document.</p>",
    // Submittable, immediate
    "in*":
      "<p>Sorry! Looks like we need more information. Answer all of the questions to enable submission.</p>",
    "iy*": "<p>Submitted! Your responses will be reviewed soon.</p>",
    iyn: "<p>Good job!</p> <p>You've answered all of the questions and can now submit your response.</p>",
    // Submittable, w/grace period
    "gn*":
      "<p>Sorry! Looks like we need more information. Answer all of the questions to enable submission.</p>",
    "gy*": "<p>Submitted! Your responses will be reviewed soon.</p>",
    gyn: "<p>Good job!</p> <p>You've answered all of the questions and can now submit your response.</p>",
  },

  // --
  // Content of final action modal sidebar, above conditional help link.
  final_content_secondary: {
    "***": "<p>Our support team is ready to assist</p>",
  },

  // --
  // Header text of final action modal sidebar.
  final_content_secondary_headline: {
    "***": "Need help?",
  },

  // --
  // The download button text in the final modal. Automatically
  // enabled/disabled based on state of doc.
  final_download_button_text: {
    "n**": "Download",
    "i**": "Download a copy",
    "g**": "Download a copy",
  },

  // --
  // The submit button text in the final modal. Only present
  // for submittable docs. Automatically enabled/disabled based
  // on state of doc.
  final_submit_button_text: {
    "***": "Submit",
    "**p": "Submitted!",
    "**l": "Submitted!",
  },

  // --
  // Build page at upper right; preview page beneath title.
  final_link_text: {
    "n**": "Download",
    "i**": "Submit",
    "g**": "Submit",
  },

  // --
  // Title shown at top of final view (aka download modal).
  final_view_headline: {
    "n**": "Download Document",
    "i**": "Submit",
    "g**": "Submit",
  },

  // --
  // Help link href attribute value to potentially be used throughout
  // docbuilder, but  current usage is limited to sidebar of the final
  // modal when requirements are not yet met. Absolute URL or email
  // address prefixed with `mailto:`.
  help_link_href: {
    "***": "https://www.healthiergeneration.org/take-action/get-help",
  },

  // --
  // Help link text to potentially be used throughout docbuilder, but
  // current usage is limited to sidebar of the final modal when requirements
  // are not yet met.
  help_link_text: {
    "***": "Get in touch",
  },

  // --
  // Preview page beneath page title.
  preview_back_link_text: {
    "***": "Back",
  },

  // --
  // Build page at upper right.
  preview_link_text: {
    "***": "Preview",
  },

  // --
  // Preview page at upper right.
  preview_print_link_text: {
    "***": "Print this Preview",
  },

  // --
  // If populated, text that will be displayed in an alert container
  // at the top of the build and preview pages. Plain text only.
  primary_view_alert_message: {
    "n**": "",
    "i*l":
      "Viewing in read-only mode. Your information has been submitted and no additional changes can be made.",
    "g*p":
      'Viewing in read-only mode. Your information has been submitted but not yet locked. If changes are needed, tap the "submit" link above and follow the provided instructions.',
    "g*l":
      "Viewing in read-only mode. Your information has been submitted and no additional changes can be made.",
  },

  // --
  // Alert "severity" applied to the primary alert container wrapping
  // primary_view_alert_message. If primary_view_alert_message is empty,
  // this setting is not applicable. Value must be one of the following:
  // error, info, success, warning
  primary_view_alert_severity: {
    "***": "info",
  },

  // --
  // If populated, text that will be displayed in an alert container
  // at the top of the subsection and final modal views.
  secondary_view_alert_message: {
    "n**": "",
    "i*l":
      "Viewing in read-only mode. Your information has been submitted and no additional changes can be made.",
    "g*p": "Viewing in read-only mode. Your information has been submitted but not yet locked.",
    "g*l":
      "Viewing in read-only mode. Your information has been submitted and no additional changes can be made.",
  },

  // --
  // Alert "severity" applied to the secondary alert container wrapping
  // secondary_view_alert_message. If secondary_view_alert_message is
  // empty, this setting is not applicable. Value must be one of the
  // following: error, info, success, warning
  secondary_view_alert_severity: {
    "***": "info",
  },

  // --
  // Button text for unsubmit button.
  unsubmit_button_text: {
    // Unsubmit button is available to users that can edit
    // a doc as long as the status is still "pending".
    "**p": "Unsubmit",
    // Only admin users can see the unsubmit button for
    // a locked doc.
    "**l": "Unlock and unsubmit",
  },

  // --
  // Fine-print help text for unsubmit button.
  unsubmit_help_text: {
    // When a doc is pending, the unsubmit help text and unsubmit button itself
    // are visible to all users that can edit the doc.
    "**p":
      "Your information has been submitted but not yet locked. It will lock automatically soon. Until then, you can unsubmit it here to make changes.",
    // When a doc is locked, the unsubmit help text and unsubmit button itself
    // are visible ONLY to admin users.
    "**l": "Option to unlock is only available to admin users.",
  },

  // --
  // Confirmation text when unsubmitting a submittable doc.
  unsubmit_confirmation_text: {
    "***": "Are you sure you want to unsubmit?",
  },
};

export default __default__;
