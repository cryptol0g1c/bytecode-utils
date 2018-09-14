module.exports = {
  AUX_HEADER: 'a165627a7a72305820', //0xa1 0x65 'b' 'z' 'z' 'r' '0' 0x58 0x20
  AUX_END: '0029', //0x00 0x29
  AUX_REGEXP: new RegExp('00a165627a7a72305820[a-fA-F0-9]{64}0029'),
  OPTIMIZED_FLAG: 1,
  SOLC_BIN_URL: 'https://ethereum.github.io/solc-bin/bin/list.json'
};
