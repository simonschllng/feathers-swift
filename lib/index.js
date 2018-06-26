const { Transform } = require('stream');
const crypto = require('crypto');
const from = require('from2');
const toBuffer = require('concat-stream');
const { getBase64DataURI, parseDataURI } = require('dauria');
const mimeTypes = require('mime-types');
const { extname } = require('path');
var debug = require('debug')('feathers-swift');

const {
  fromBuffer,
  bufferToHash
} = require('./feathers-swift-util');


class FeathersSwiftService {
  constructor (options) {
    if (!options) {
      throw new Error('feathers-swift: constructor `options` must be provided');
    }

    if (!options.client) {
      throw new Error('feathers-swift: constructor `options.client` must be provided');
    }

    if (!options.container) {
      throw new Error('feathers-swift: constructor `options.container` must be provided');
    }

    this.client = options.client;
    this.container = options.container;
    this.id = options.id || 'id';
  }

  async find(params) {
    return await this.client.container(this.container).list();
  }

  async get(id, params) {
    const ext = extname(id);
    const contentType = mimeTypes.lookup(ext);
    let resultId = this.id;
    var stream = new Transform()
    var end = new Promise(function(resolve, reject) {
      stream.on('error', ()=>reject());
      stream.on('finish', ()=>debug('downloaded'));
      stream._transform = function (chunk,encoding,done){
          this.push(chunk)
          done()
      }
      stream.pipe(toBuffer( (buffer) => {
        const uri = getBase64DataURI(buffer, contentType);
        resolve({
            [resultId]: id,
            uri,
            size: buffer.length
          })
      }));
    });
    this.client.container(this.container).get(id, stream);

    return await end;
  }

  async create(data, params = {}) {
    let { id, uri, buffer, contentType } = data;
    let resultId = this.id;
    if (uri) {
      const result = parseDataURI(uri);
      contentType = result.MIME;
      buffer = result.buffer;
    } else {
      uri = getBase64DataURI(buffer, contentType);
    }

    const hash = bufferToHash(buffer);
    const ext = mimeTypes.extension(contentType);

    id = id || `${hash}.${ext}`;

    var stream = new Transform()
    var end = new Promise(function(resolve, reject) {
      stream.on('error', ()=>reject());
      stream.on('finish', function () {
        debug('uploaded');
        resolve({
            [resultId]: id,
            uri,
            size: buffer.length
          })
      });
      stream._transform = function (chunk,encoding,done){
          this.push(chunk)
          done()
      }
    });

    this.client.container(this.container).create(id, stream);

    fromBuffer(buffer).pipe(stream);

    return await end;
  }

  // async patch(id, data, params) {
  //   return await this.client.container(this.container).update(id, {tour: data.tour});
  // }

  // async update(id, data, params) {}

  async remove(id, params) {
    const when = (params.query.when && typeof params.query.when === 'number') ? params.query.when : 0;
    //TODO: Return the object
    return await this.client.container(this.container).delete(id, when);
  }

  setup(app, path) {}
}

module.exports = function init (options) {
  return new FeathersSwiftService(options);
};

module.exports.Service = FeathersSwiftService;
