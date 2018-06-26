var debug = require('debug')('feathers-swift');

class FeathersSwiftMetaService {
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
  }

  // async find(params) { }

  async get(id, params) {
    return await this.client.container(this.container).meta(id);;
  }

  // async create(data, params = {}) { }

  async patch(id, data, params) {
    let current = await this.get(id);
    let future = Object.assign({}, current, data);
    return await this.update(id, future);
  }

  async update(id, data, params) {
    return await this.client.container(this.container).update(id, data);
  }

  async remove(id, params) {
    return await this.patch(id, {});
  }

  setup(app, path) {}
}

module.exports = function init (options) {
  return new FeathersSwiftMetaService(options);
};

module.exports.SwiftMeta = FeathersSwiftMetaService;
