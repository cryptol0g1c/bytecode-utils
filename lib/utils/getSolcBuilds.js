const axios = require('axios');
const { SOLC_BIN_URL } = require('../constants');

/**
 * Get solc-builds that can be used to set a specific solc version using setSolcVersion()
 */
async function getSolcBuilds() {
  try {
    let response = await axios.get(SOLC_BIN_URL);
    let builds = response.data.builds;
    let buildVersions = builds.map(({ longVersion }) => longVersion);

    return buildVersions;
  } catch (error) {
    return error;
  }
}

module.exports = getSolcBuilds;
