// Fetch the UnirisToken contract
var UnirisToken = artifacts.require("./UnirisToken.sol");

// JavaScript export
module.exports = function(deployer, network, accounts) {
    // Deployer is the Truffle wrapper for deploying
    // contracts to the network

    const vesting_release_rate = 33;
    const vesting_end_date = Math.floor(new Date("2022/12/31").getTime() / 1000)
    const cliff_end_date = Math.floor(new Date("2020/12/31").getTime() / 1000)

    // Deploy the contract to the network
    deployer.deploy(UnirisToken, 
        accounts[0], 
        accounts[1], 
        accounts[2], 
        accounts[3],
        accounts[4],
        accounts[5],
        accounts[6],
        accounts[7],
        accounts[8],
        vesting_end_date,
        cliff_end_date,
        vesting_release_rate);
}