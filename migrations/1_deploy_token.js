// Fetch the UnirisToken contract
var UnirisToken = artifacts.require("UnirisToken.sol");

// JavaScript export
module.exports = async function(deployer, network, accounts) {
    let funding_pool_benificiary
    let deliverables_beneficiary
    let network_pool_beneficiary
    let enhancement_beneficiary
    let team_beneficiary
    let exch_pool_beneficiary
    let marketing_beneficiary
    let foundation_beneficiary

    switch (network) {
        case "live":
            funding_pool_benificiary = "0xC545528CB411aA971De48F5d375aF27B685a7651"
            deliverables_beneficiary = "0xEA9095614A40C34f2d6D62514a8B9305873E6763"
            network_pool_beneficiary = "0x857fFe3A3F4d47c5459b215Fd09Ddd80eE0B2f00"
            enhancement_beneficiary = "0xc3255E34F122f8E5Ac055d308Bf5898173212AfC"
            team_beneficiary = "0xb4cF889F7F0C4de5c43dbB67C11b8F96b6CfBf91"
            exch_pool_beneficiary = "0x2Da4fDdc9e610b1D5Ae4340d20455d53C9481b12"
            marketing_beneficiary = "0xEbC52520eE81A0E87549CE193b3f5fc086EddC69"
            foundation_beneficiary = "0xa8B2134E17Bd65427AeA59d5b8AcA22F3c181E97"
            break;
        case "ropsten":
            funding_pool_benificiary = "0x8CD757fa4630cfFF094e7231854DEa3745Cc6c0D" //multisig gnosis
            deliverables_beneficiary = "0xBF2769bDC5feA4A22E3E17762407A6E612e400aa" //multisig gnosis
            network_pool_beneficiary = "0x77b7DA3e1b0650eC9F1e869897b84437Bcc015Bb"
            enhancement_beneficiary = "0xcE3652FC46ADA8d4E3A893A7c6d2410975E7190D"
            team_beneficiary = "0x198815DAe9dB8460eA44Df4c4752094845c0Ac25"
            exch_pool_beneficiary = "0x9D315Bab7E7c0d90d94b99193dBaD3b1C9d4d0f7"
            marketing_beneficiary = "0xeB47A8F252D865c45093A989a7b1F4584BBDb25b"
            foundation_beneficiary = "0x6b3b47F6234916D737Ea6e73E7c92D267598e069"
            break;
        default:
            funding_pool_benificiary = accounts[0]
            deliverables_beneficiary = accounts[1]
            network_pool_beneficiary = accounts[2]
            enhancement_beneficiary = accounts[3]
            team_beneficiary = accounts[4]
            exch_pool_beneficiary = accounts[5]
            marketing_beneficiary = accounts[6]
            foundation_beneficiary = accounts[7]
    }

    // Deploy the contract to the network
    deployer.deploy(UnirisToken, 
        funding_pool_benificiary, 
        deliverables_beneficiary, 
        network_pool_beneficiary,
        enhancement_beneficiary,
        team_beneficiary,
        exch_pool_beneficiary,
        marketing_beneficiary,
        foundation_beneficiary);
}