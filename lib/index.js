const solc = require('solc');
const Web3 = require('web3');

const { AUX_HEADER, AUX_REGEXP, OPTIMIZED_FLAG } = require('./constants');

module.exports = provider => {
  if (!provider) {
    throw new Error('Please provide an http provider.');
  }

  const web3 = new Web3(new Web3.providers.HttpProvider(provider));

  /**
   * Function that get the code of the remote smart contract address
   * @param {Ethereum contract address} address
   */
  function getContractCode(address) {
    return web3.eth.getCode(address)
      .then(code => code.split('0x')[1])
      .catch(error => error);
  }

  /**
   * Set the compiler to a proper historical or latest version
   * @param {Solc compiler version} _version It can be found using getSolcBuilds
   */
  function getSolcVersion(_version) {
    let version = _version || 'latest';

    return new Promise((resolve, reject) => {
      solc.loadRemoteVersion(version, (error, SOLC_COMPILER) => {
        if (error) {
          reject(error);
        }

        resolve(SOLC_COMPILER);
      });
    })
  }

  /**
   * Compile the source and process the output for later usage
   * @param {Solc version} solcVersion
   * @param {Solidity code of the smart contract} contractCode
   * @param {Name of the contract} contractName
   * @param {Optimized flag} optimized defaults to 1
   */
  async function compile(solcVersion = 'latest', contractCode, contractName, optimized = OPTIMIZED_FLAG) {
    const solcCompiler = await getSolcVersion(solcVersion);
    const output = solcCompiler.compile(contractCode, optimized);
    const compiled = output.contracts[`:${contractName}`];
    const metadata = JSON.parse(compiled.metadata);

    return {
      assembly: compiled.assembly,
      bytecode: {
        deployed: compiled.bytecode,
        runtime: compiled.runtimeBytecode,
        functional: compiled.runtimeBytecode.split(AUX_HEADER)[0],
      },
      auxdata: compiled.runtimeBytecode.split(AUX_HEADER)[1],
      abi: compiled.interface,
      opcodes: compiled.opcodes,
      metadata: metadata,
      swarm: metadata.sources[''].urls[0]
    };
  }

  /**
   * Function that compares sources with remote contract code
   * @param {Deployed contract address} address
   * @param {Solc version} solcVersion
   * @param {Solidity code of the smart contract} contractCode
   * @param {Name of the contract} contractName
   * @param {Optimized flag} optimized defaults to 1
   */
  async function compareBytecode(address, solcVersion = 'latest', contractCode, contractName, optimized = OPTIMIZED_FLAG) {
    try {
      let remoteCode = await getContractCode(address);
      let localCode = await compile(solcVersion, contractCode, contractName, optimized);

      let remoteFunctionalCode = remoteCode.split(AUX_HEADER)[0];

      if (localCode.bytecode.runtime == remoteCode) {
        return { match: true, msg: 'bytecode and metadata match exactly' };
      } else if (localCode.bytecode.runtime != remoteCode && localCode.bytecode.functional == remoteFunctionalCode) {
        return { match: true, msg: 'Warning: aux/metadata bytes are different, possible source filename mismatch' };
      } else {
        return { match: false, msg: 'bytecode does not match' };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Given compiled bytecode process it an returns information
   * @param {compiled hexa bytecode} _bytecode
   * @param {Array of parameter types} _parameterTypes ['int', 'address']
   */
  function processBytecode(_bytecode, _parameterTypes) {
    const auxdata = AUX_REGEXP.exec(_bytecode)[0];
    const splittedBytecode = _bytecode.split(auxdata);

    let bytecode = {};

    if (splittedBytecode[1] != '' && _parameterTypes) {
      let encodedParams = `0x${splittedBytecode[1]}`;
      let decodeParameters = web3.eth.abi.decodeParameters(_parameterTypes, encodedParams);
      bytecode.decodedParams = decodeParameters;
    }

    bytecode.compiled = _bytecode;
    bytecode.metadata = auxdata;
    bytecode.swarmHash = auxdata.slice(20, -4);

    return bytecode;
  }

  return {
    compareBytecode,
    compile,
    getContractCode,
    getSolcVersion,
    processBytecode
  };
};
