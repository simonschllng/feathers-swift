const SwiftClient = require('openstack-swift-client');
const credentials = require('./credentials.json');

const swift = new SwiftClient(new SwiftClient.KeystoneV3Authenticator(credentials));
const serviceOptions = {
  client: swift,
  container: 'feathers-swift-test',
  id: 'id'
};

module.exports = serviceOptions;
