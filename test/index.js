const assert = require('assert');
const { join } = require('path');
const { getBase64DataURI } = require('dauria');

const SwiftObjects = require('../lib/objects');
const SwiftMeta = require('../lib/meta');
const { bufferToHash } = require('../lib/util');

const swiftOptions = require('./swift-options');
const credentials = require('./credentials.json');

describe('feathers-swift', () => {
  const content = Buffer.from('hello world!');
  const metaData = { "testparameter": "test" };
  const contentHash = bufferToHash(content);
  const contentType = 'text/plain';
  const contentUri = getBase64DataURI(content, contentType);
  const contentExt = 'txt';
  const contentId = `${contentHash}.${contentExt}`;

  before(() => swiftOptions.client.create(swiftOptions.container));

  it('is CommonJS compatible', () => {
    assert.equal(typeof SwiftObjects, 'function');
  });

  describe('objects CR_D', () => {
    assert.equal(typeof SwiftObjects, 'function', 'exports factory function');

    const objects = SwiftObjects(swiftOptions);

    it('creates objects', () => {
      return objects.create({ uri: contentUri }).then(res => {
          assert.equal(res.id, contentId);
          assert.equal(res.uri, contentUri);
          assert.equal(res.size, content.length);
        });
    });

    it('reads objects', () => {
      return objects.get(contentId).then(res => {
          assert.equal(res.id, contentId);
          assert.equal(res.uri, contentUri);
          assert.equal(res.size, content.length);
        });
    });

    it('finds objects', () => {
      return objects.find().then(res => {
          assert.equal(res.length, 1);
        });
    });

    it('removes objects', () => {
      return objects.remove(contentId).then(res => {
        assert.equal(res.id, contentId);
        assert.equal(res.uri, contentUri);
        assert.equal(res.size, content.length);
        return objects.get(contentId)
          .catch(err => assert.ok(err, '.get() to non-existent id should error'));
      });
    });

    after(() => setTimeout(() => {}, 500));
  });


  describe('meta CRUD', () => {
    assert.equal(typeof SwiftMeta, 'function', 'exports factory function');

    const objects = SwiftObjects(swiftOptions);
    const meta = SwiftMeta(swiftOptions);

    before(() => {objects.create({ uri: contentUri })});

    it('adds meta data', () => {
      return meta.update(contentId, metaData).then(res => {
          assert.deepEqual(res, metaData);
        });
    });

    it('reads meta data', () => {
      return meta.get(contentId).then(res => {
          assert.deepEqual(res, metaData);
        });
    });

    it('updates meta data', () => {
      return meta.patch(contentId, {"anotherparameter": "test"}).then(res => {
          assert.equal(res.testparameter, metaData.testparameter);
          assert.equal(res.anotherparameter, "test");
        });
    });

    it('removes meta data', () => {
      return meta.remove(contentId).then(res => {
          assert.equal(res.testparameter, metaData.testparameter);
          assert.equal(res.anotherparameter, "test");
        });
    });

    after(() => objects.remove(contentId));

  });


  after((done) => setTimeout(() => {swiftOptions.client.delete(swiftOptions.container), done()}, 500));
});
