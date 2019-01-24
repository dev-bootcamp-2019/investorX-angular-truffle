// This file tests the Election smart contract. 
// It covers elections opening, gurus's wallet submission and addition, 
//  voting and election closing. 
// It also checks emitted events and some 'revert' cases.

// However, this file does not cover the functions inherited from its parent (BaseElection)
//  because they are already covered at electionBase.test.js

const { shouldFail, expectEvent } = require('openzeppelin-test-helpers');

const Election = artifacts.require("./Election.sol");

contract('Election', function (accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];
    
    // Bytes32 is used to store names at the contract because it is cheaper in term of ethereum-gas
    // The following 2 lines are just a conversion from letters to its bytes32 representation:
    const aliceNameAsBytes32 = web3.utils.fromAscii('Mrs. Alice').padEnd(66, '0');
    const bobNameAsBytes32 = web3.utils.fromAscii('Mr. Bob').padEnd(66, '0');

    const voter1 = accounts[3];
    const voter2 = accounts[4];
    const voter3 = accounts[5];

    // Check the emittance of ElectionOpened event at deployment 
    it("At deployment, the ElectionOpened event should be emitted", async () => {
        const newElection = await Election.new();
        expectEvent.inConstruction(newElection, 'ElectionOpened', { 'chairperson': owner });
    });

    // Check that 'closed' is false after deployment
    it("At deployment, the Election should be opened by default", async () => {
        const election = await Election.deployed();

        const isClosed = await election.closed.call({ from: alice });
        assert.equal(isClosed, false, 'the election should not be closed after deployment');
    });

    // Check that the self-nomination for gurus. And check the related event: 'GuruAdded'
    it("Anyone should be able to add himself/herself as a guru", async () => {
        const election = await Election.deployed();

        const initialGurusCountResult = await election.getGurusCount.call({ from: owner });
        assert.equal(initialGurusCountResult.toNumber(), 0, 'After deployment, number of gurus should be 0');

        const beGuruResult = await election.beGuru(aliceNameAsBytes32, { from: alice });
        expectEvent.inLogs(beGuruResult.logs, 'GuruAdded', { wallet: alice, name: aliceNameAsBytes32, addedBy: alice });

        const guruResult = await election.gurus.call(alice, { from: alice });
        assert.equal(guruResult[0], aliceNameAsBytes32, 'Problem adding self as a guru');

        const gurusCountResult = await election.getGurusCount.call({ from: owner });
        assert.equal(gurusCountResult.toNumber(), 1, 'Problem counting after adding the 1st guru');

    });

    // Check that nomination of a guru by the chairperson
    it("The Chairperson should be able to add a guru", async () => {
        const election = await Election.deployed();

        const addGuruResult = await election.addGuru(bobNameAsBytes32, bob, { from: owner });
        expectEvent.inLogs(addGuruResult.logs, 'GuruAdded', { wallet: bob, name: bobNameAsBytes32, addedBy: owner });

        const guruResult = await election.gurus.call(alice, { from: alice });
        assert.equal(guruResult[0], aliceNameAsBytes32, 'Problem adding a guru by chairperson');

        const gurusCountResult = await election.getGurusCount.call({ from: owner });
        assert.equal(gurusCountResult.toNumber(), 2, 'Problem adding counting after adding the 2nd guru');

    });

    // Check voting and its event 'Voted'
    it("Followers can vote for gurus' wallets", async () => {
        const election = await Election.deployed();

        const votesCount0Result = await election.getVotesCount.call(alice, { from: voter1 });
        assert.equal(votesCount0Result.toNumber(), 0, 'Number of votes should be 0 at the beginning');

        const voting1Result = await election.vote(alice, { from: voter1 });
        expectEvent.inLogs(voting1Result.logs, 'Voted', { guruWallet: alice, voter: voter1 });

        const voting2Result = await election.vote(alice, { from: voter2 });
        expectEvent.inLogs(voting2Result.logs, 'Voted', { guruWallet: alice, voter: voter2 });

        const votesCount2Result = await election.getVotesCount.call(alice, { from: voter1 });
        assert.equal(votesCount2Result.toNumber(), 2, 'Number of votes should be 2, after 2 votes');
    });

    // Check Election closure
    it("The Chairperson can close the Election", async () => {
        const election = await Election.deployed();

        const closingResult = await election.close({ from: owner });
        expectEvent.inLogs(closingResult.logs, 'ElectionClosed', { chairperson: owner });

        const isClosed = await election.closed.call({ from: alice });
        assert.equal(isClosed, true, 'The chairperon should be able to close the election');
    });

    // Verify voting failure after Election closure
    it("Followers cannot vote after the Election ends", async () => {
        const election = await Election.deployed();

        const votingAfterClosingResult = election.vote(bob, { from: voter3 });
        await shouldFail.reverting(votingAfterClosingResult);
    });
});