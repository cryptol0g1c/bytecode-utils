const axios = require('axios');
const { SOLC_BIN_URL } = require('../constants');

/**
 * Get information about the historical Solc releases
 */
async function getSolcVersions() {
  try {
    const response = await axios.get(SOLC_BIN_URL);

    return response.data;
  } catch (error) {
    return error;
  }
}

module.exports = getSolcVersions;
