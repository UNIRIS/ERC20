const UnirisToken = artifacts.require("UnirisToken");

contract("UnirisToken", accounts => {
    
    it("should allocate supply to the beneficiaries", async () => {
        const now = new Date();
        const vesting_end_date = Math.floor(now.getTime() / 1000) + 10
        const cliff_end_date = Math.floor(now.getTime() / 1000) + 1

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
            vesting_end_date,
            cliff_end_date,
            33
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

    it("should only transfer from public sale or private sale during the vesting period", async () => {
        const now = new Date();
        const vesting_end_date = Math.floor(new Date("2020/12/31").getTime() / 1000)
        const cliff_end_date = Math.floor(new Date("2019/12/31").getTime() / 1000)

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
            vesting_end_date,
            cliff_end_date,
            33
        )

        //Direct transfer are not authorized
        try {
            await token.transfer(accounts[3], 10000, { from: accounts[2]})
        }
        catch(ex) {
            assert.equal(ex.reason, "Cliff period is not reached yet")
        }

        //Only transferFrom coming from the public sale wallet
        await token.approve(accounts[9], 10000, { from: accounts[1] })
        await token.transferFrom(accounts[1], accounts[2], 10000, { from: accounts[9] })

        let balance = await token.balanceOf(accounts[1])
        assert.equal("2999999999999999999999990000", balance.toString())

        //Only private sale direct transfer are authorized during the vesting period
        await token.transfer(accounts[5], 10000, { from: accounts[0] })
        balance = await token.balanceOf(accounts[0])
        assert.equal("819999999999999999999990000", balance.toString())
    })

    it("should only transfer after the cliff period and less than the yearly release rate", async () => {
        const now = new Date();
        const vesting_end_date = Math.floor(new Date("2020/12/31").getTime() / 1000)
        const cliff_end_date = Math.floor(now.getTime() / 1000) + 1

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
            vesting_end_date,
            cliff_end_date,
            33
        )

        await sleep(2000)

        //Private sale transfer
        await token.transfer(accounts[9], 1000, { from: accounts[0]})

        //First transfer during the vesting period
        await token.transfer(accounts[7], 100, { from: accounts[9] })
        balance = await token.balanceOf(accounts[9])
        assert.equal("900", balance.toString())

        //Accumulative transfer during the vesting period
        await token.transfer(accounts[7], 100, { from: accounts[9] })
        balance = await token.balanceOf(accounts[9])
        assert.equal("800", balance.toString())

        //Accumulative transfer during the vesting period
        await token.transfer(accounts[7], 100, { from: accounts[9] })
        balance = await token.balanceOf(accounts[9])
        assert.equal("700", balance.toString())

        releases = await token.releases(accounts[9], 0)
        assert.equal("300", releases.amount.toString())

        //Out of release allowance transfer during the vesting period
        try {
            await token.transfer(accounts[7], 100, { from: accounts[9] })
        }
        catch(e) {
            assert.equal("Cannot release more than the yearly release rate", e.reason)
        }
    })

    it("should be able to transfer any assets after the vesting period", async () => {
        const now = new Date();
        const vesting_end_date = Math.floor(now.getTime() / 1000) + 5
        const cliff_end_date = Math.floor(now.getTime() / 1000) + 1

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
            vesting_end_date,
            cliff_end_date,
            33
        )

        await sleep(6000)

        await token.transfer(accounts[9], 100000000000, { from: accounts[2] })
        const balance = await token.balanceOf(accounts[9])
        assert.equal("100000000000", balance.toString())
    })
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}