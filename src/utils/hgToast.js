import { toast } from 'react-toastify';

//
// Wrapper for toastify notifications.
// -----------------------------------
// Standardizes various parameters to reduce per-use
// configuration needs.
//

// @TODO Use severity colors from styleVars and refine the display in general.

export default function hgToast(message, severity = 'success', callerOpts = {}) {
  const defOpts = {
    autoClose: 3500,
    hideProgressBar: true,
    pauseOnFocusLoss: false,
    pauseOnHover: true,
    position: 'top-right'
  };
  const opts = { ...defOpts, ...callerOpts };

  let toastType;
  switch (severity) {
    case 'error':
      toastType = toast.TYPE.ERROR;
      break;
    case 'success':
      toastType = toast.TYPE.SUCCESS;
      break;
    case 'warn':
    case 'warning':
      toastType = toast.TYPE.WARN;
      break;
    case 'info':
    default:
      toastType = toast.TYPE.INFO;
      break;
  }

  toast(message, {
    autoClose: opts.autoClose,
    hideProgressBar: opts.hideProgressBar,
    position: opts.position,
    type: toastType
  });
}
