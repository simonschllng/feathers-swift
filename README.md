# Feathers Service for Openstack Swift

This module adds two services: `SwiftObjects` and `SwiftMeta`. Both operate on the same swift object, one manipulates the payload, the other the meta data. The `SwiftMeta` service has no `create` method. It operates on the key of a `SwiftObjects` entity.

**Work in progress. Contribution welcome!**

## Usage

#### objects.service.js:

````js
const { SwiftObjects } = require('feathers-swift');
const swiftOptions = require('../swift-options');

app.use('/objects',
  multipartMiddleware.single('upload'),
  function(req,res,next){
    req.feathers.file = req.file;
    next();
  },
  SwiftObjects(swiftOptions));

const service = app.service('objects');

service.hooks(hooks);

````

#### objects-meta.service.js:

````js
const { SwiftMeta } = require('feathers-swift');
const swiftOptions = require('../swift-options');

app.use('/objects-meta', SwiftMeta(swiftOptions));

const service = app.service('objects-meta');

service.hooks(hooks);

````

#### swift-options.js

````js
const SwiftClient = require('openstack-swift-client');

const swift = new SwiftClient(new SwiftClient.KeystoneV3Authenticator(app.get('swiftCredentials')));
const serviceOptions = {
  client: swift,
  container: app.get('objectStoreContainer'),
  id: 'id'
};

module.exports = serviceOptions;
````
