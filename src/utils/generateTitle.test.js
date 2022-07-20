import generateTitle from './generateTitle';

test('Given title, document.title will be title | suffix', () => {
  generateTitle('Dashboard');
  expect(document.title).toEqual(
    'Dashboard | Alliance for a Healthier Generation'
  );
});

test('Given no title, document.title will be suffix', () => {
  generateTitle();
  expect(document.title).toEqual('Alliance for a Healthier Generation');
});
