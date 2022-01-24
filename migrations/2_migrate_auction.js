var marketplace = artifacts.require("Marketplace");
var token = artifacts.require("MarketplaceToken");

module.exports = function(deployer) {

    deployer.deploy(token).then(function() {
        return deployer.deploy(marketplace, token.address);
      });
      
};
