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
        )

        balance = await token.balanceOf(accounts[0])
        assert.equal(balance.toString(), "3820000000000000000000000000")

        balance = await token.balanceOf(accounts[1])
        assert.equal(balance.toString(), "2360000000000000000000000000")

        balance = await token.balanceOf(accounts[2])
        assert.equal(balance.toString(), "1460000000000000000000000000")

        balance = await token.balanceOf(accounts[3])
        assert.equal(balance.toString(), "900000000000000000000000000")

        balance = await token.balanceOf(accounts[4])
        assert.equal(balance.toString(), "560000000000000000000000000")

        balance = await token.balanceOf(accounts[5])
        assert.equal(balance.toString(), "340000000000000000000000000")

        balance = await token.balanceOf(accounts[6])
        assert.equal(balance.toString(), "340000000000000000000000000")

        balance = await token.balanceOf(accounts[7])
        assert.equal(balance.toString(), "220000000000000000000000000")
    })

    it ("should prevent transfer when coming from deliverable or network pool and more than 10% of the supply", async () => {
        token = await UnirisToken.new(
            accounts[0], 
            accounts[1], 
            accounts[2], 
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7]
        )

        try {
            await token.transfer(accounts[8], "2000000000000000000000000000", { from: accounts[2] })
        }
        catch(ex) {
            assert.equal(ex.reason, "Only 10% of the deliverable supply is unlocked before mainnet")
        }

        //236000000000000000000000000 is 10% of the deliverable supply
        await token.transfer(accounts[8], "236000000000000000000000000", { from: accounts[2] })
        balance = await token.balanceOf(accounts[2])
        assert.equal("2124000000000000000000000000", balance.toString())

        //73000000000000000000000000 is 5% of the network supply
        await token.transfer(accounts[9], "73000000000000000000000000", { from: accounts[3] })
        await token.transfer(accounts[9], "73000000000000000000000000", { from: accounts[3] })
        try {
            await token.transfer(accounts[9], "73000000000000000000000000", { from: accounts[3] })
        }
        catch(ex) {
            assert.equal(ex.reason, "Only 10% of the network supply is unlocked before mainnet")
        }
        balance = await token.balanceOf(accounts[9])
        assert.equal("146000000000000000000000000", balance.toString())
    })

    it("should prevent when transfer from enhancement wallet", async() => {
        token = await UnirisToken.new(
            accounts[0], 
            accounts[1], 
            accounts[2], 
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
        )

        try {
            await token.transfer(accounts[8], "100000000000000", { from: accounts[4] })
        }
        catch(ex) {
            assert.equal("Enhancement wallet is locked forever until mainnet", ex.reason)
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
            accounts[7]
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
