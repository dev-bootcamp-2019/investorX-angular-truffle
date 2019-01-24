var ElectionBase = artifacts.require("./ElectionBase.sol");
var Election = artifacts.require("./Election.sol");
var ElectionFactory = artifacts.require("./ElectionFactory.sol");

module.exports = function(deployer) {
  // ElectionBase is only used as a base Contract.
  // However, it is deployed just to test its functionality.
  deployer.deploy(ElectionBase);
  
  deployer.deploy(Election);
  deployer.deploy(ElectionFactory);
};
