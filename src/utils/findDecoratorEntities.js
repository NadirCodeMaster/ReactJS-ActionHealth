/*
 * Decorator find functionality for dynamic markup
 */
export function findAbbrTitleEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    if (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'ABBRTITLE'
    ) {
      return true;
    }
  }, callback);
}

export function findAbbrDataEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    if (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'ABBRDATA'
    ) {
      return true;
    }
  }, callback);
}

export function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    );
  }, callback);
}
