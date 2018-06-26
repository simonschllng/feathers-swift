const { SwiftObjects } = require('./objects');
const { SwiftMeta } = require('./meta');

module.exports.SwiftObjects = function initObjects (options) {
  return new SwiftObjects(options);
};
module.exports.SwiftMeta = function initMeta (options) {
  return new SwiftMeta(options);
};
