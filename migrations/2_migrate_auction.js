var MyAuctionContract = artifacts.require("MyAuction");

module.exports = function(deployer) {

    // third argument represents the contract owner address and should be changed accordingly
    deployer.deploy(MyAuctionContract, 1, "0xE07c9671C112956743430596a03181bb7d97E6a3", "Dacia", "97531");

};
