const UnirisToken = artifacts.require("UnirisToken");

contract("UnirisToken", accounts => {
    
    it("should allocate supply to the beneficiaries", async () => {
        token = await UnirisToken.new(
            accounts[0], 
            accounts[1], 
            accounts[2], 
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
            accounts[8],
        )

        balance = await token.balanceOf(accounts[0])
        private_sale_supply = await token.private_sale_supply()
        assert.equal(balance.toString(), private_sale_supply.toString())

        balance = await token.balanceOf(accounts[1])
        public_sale_supply = await token.public_sale_supply()
        assert.equal(balance.toString(), public_sale_supply.toString())

        balance = await token.balanceOf(accounts[2])
        deliverable_supply = await token.deliverable_supply()
        assert.equal(balance.toString(), deliverable_supply.toString())

        balance = await token.balanceOf(accounts[3])
        network_pool_supply = await token.network_pool_supply()
        assert.equal(balance.toString(), network_pool_supply.toString())

        balance = await token.balanceOf(accounts[4])
        enhancement_supply = await token.enhancement_supply()
        assert.equal(balance.toString(), enhancement_supply.toString())

        balance = await token.balanceOf(accounts[5])
        team_supply = await token.team_supply()
        assert.equal(balance.toString(), team_supply.toString())

        balance = await token.balanceOf(accounts[6])
        exch_pool_supply = await token.exch_pool_supply()
        assert.equal(balance.toString(), exch_pool_supply.toString())

        balance = await token.balanceOf(accounts[7])
        marketing_supply = await token.marketing_supply()
        assert.equal(balance.toString(), marketing_supply.toString())

        balance = await token.balanceOf(accounts[8])
        foundation_supply = await token.foundation_supply()
        assert.equal(balance.toString(), foundation_supply.toString())
    })

    it ("should prevent transfer when coming from deliverable or team and more than 10% of the supply", async () => {
        token = await UnirisToken.new(
            accounts[0], 
            accounts[1], 
            accounts[2], 
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
            accounts[8]
        )

        try {
            await token.transfer(accounts[8], "2000000000000000000000000000", { from: accounts[2] })
        }
        catch(ex) {
            assert.equal(ex.reason, "Only 10% of the supply is unlocked")
        }

        //236000000000000000000000000 is 10% of the deliverable supply
        await token.transfer(accounts[8], "236000000000000000000000000", { from: accounts[2] })
        balance = await token.balanceOf(accounts[2])
        assert.equal("2124000000000000000000000000", balance.toString())

        //28000000000000000000000000 is 5% of the team supply
        await token.transfer(accounts[9], "28000000000000000000000000", { from: accounts[5] })
        await token.transfer(accounts[9], "28000000000000000000000000", { from: accounts[5] })
        try {
            await token.transfer(accounts[9], "28000000000000000000000000", { from: accounts[5] })
        }
        catch(ex) {
            assert.equal(ex.reason, "Only 10% of the supply is unlocked")
        }
        balance = await token.balanceOf(accounts[9])
        assert.equal("56000000000000000000000000", balance.toString())
    })

    it("should prevent when transfer from locked wallet", async() => {
        token = await UnirisToken.new(
            accounts[0], 
            accounts[1], 
            accounts[2], 
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
            accounts[8]
        )

        try {
            await token.transfer(accounts[8], "100000000000000", { from: accounts[3] })
        }
        catch(ex) {
            assert.equal("Locked account", ex.reason)
        }

        try {
            await token.transfer(accounts[8], "100000000000000", { from: accounts[4] })
        }
        catch(ex) {
            assert.equal("Locked account", ex.reason)
        }
    })

    it('should could not make any transfer once paused', async() => {
        token = await UnirisToken.new(
            accounts[0], 
            accounts[1], 
            accounts[2], 
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
            accounts[8]
        )

        await token.pause()

        try {
            await token.transfer(accounts[9], "1000000000000")
        }
        catch(ex) {
            assert.equal("Pausable: paused", ex.reason)
        }
    })

})
