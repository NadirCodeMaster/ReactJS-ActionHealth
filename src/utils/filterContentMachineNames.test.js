import filterContentMachineNames from './filterContentMachineNames';

const mockContent = {
  data: {
    sitewide_alert: {
      id: 1,
      machine_name: 'sitewide_alert'
    },
    my_organizations_tip_1_body: {
      id: 57,
      machine_name: 'my_organizations_tip_1_body'
    }
  }
};

const machineNames = ['test_content_1', 'test_content_2'];

test('Creates comma dlimited list of machine names not in content for url params', () => {
  expect(filterContentMachineNames(mockContent, machineNames)).toEqual(
    'test_content_1,test_content_2'
  );
});
