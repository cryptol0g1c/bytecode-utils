const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const tmp = require('tmp');
const truffleFlattener = require('truffle-flattener');

const contractFlatten = async (contractName, contractCode, files) => {
  const tempDir = tmp.dirSync();
  const pathName = path.join(tempDir.name, `${contractName}.sol`);

  const contractToImportPaths = files.map(({ name, code }) => {
    const pathName = path.join(tempDir.name, `${name}.sol`);

    fs.writeFileSync(pathName, code, {
      encoding: 'utf8'
    });

    return pathName;
  });

  fs.writeFileSync(pathName, contractCode, {
    encoding: 'utf8'
  });

  const flattened = await truffleFlattener([pathName, ...contractToImportPaths]);

  rimraf(tempDir.name, () => { });

  return flattened;
};

module.exports = contractFlatten;
