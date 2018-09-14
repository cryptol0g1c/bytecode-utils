const flatten = require('./lib/flattener/contractFlatten');
const init = require('./lib/index');
const getSolcBuilds = require('./lib/utils/getSolcBuilds');
const getSolcVersions = require('./lib/utils/getSolcVersions');

module.exports = {
  flatten,
  init,
  getSolcBuilds,
  getSolcVersions
};
