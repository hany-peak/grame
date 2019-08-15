
const GrameCoin = artifacts.require("GrameCoin");

module.exports = function(deployer) {
  deployer.deploy(GrameCoin);
};
