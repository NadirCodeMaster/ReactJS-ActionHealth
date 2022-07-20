import documentLogo from 'images/resource_document.svg';
import eventLogo from 'images/resource_event.svg';
import imageLogo from 'images/resource_image.svg';
import videoLogo from 'images/resource_video.svg';
import webpageLogo from 'images/resource_webpage.svg';

/**
 * Get resource image given a contentType
 */
export default function getResourceImage(contentType) {
  let resourceImage;

  switch (contentType) {
    case 'resource_document':
      resourceImage = documentLogo;
      break;
    case 'resource_event':
      resourceImage = eventLogo;
      break;
    case 'resource_image':
      resourceImage = imageLogo;
      break;
    case 'resource_video':
      resourceImage = videoLogo;
      break;
    case 'resource_web_page':
      resourceImage = webpageLogo;
      break;
    default:
      resourceImage = undefined;
  }

  return resourceImage;
}
