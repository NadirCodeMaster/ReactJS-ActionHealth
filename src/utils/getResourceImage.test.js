import getResourceImage from './getResourceImage';

test('Given resource machine_name, return corresponding svg src', () => {
  expect(getResourceImage('resource_video')).toEqual('resource_video.svg');
});
