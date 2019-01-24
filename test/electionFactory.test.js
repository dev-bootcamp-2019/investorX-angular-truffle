// This file tests the ElectionFactory smart contract. 
// It covers the creation, addition and closure of Elections. 
// It also checks emitted events and some 'revert' cases.

// However, this file does not cover the functions inherited from its parent (BaseElection)
//  because they are already covered at electionBase.test.js

const { shouldFail, expectEvent } = require('openzeppelin-test-helpers');

const ElectionFactory = artifacts.require("./ElectionFactory.sol");

// This is just to check for the events emitted internally when called from ElectionFactory.
// Used at function: expectEvent.inTransaction(txHash, emitter, eventName, eventArgs = {})
const Election = artifacts.require("./Election.sol"); 

contract('ElectionFactory', function (accounts) {

    const owner = accounts[0];
    const alice = accounts[1];

    // Check Election creation
    it("ElectionFactory can deploy a new Election contract", async () => {
        const electionFactory = await ElectionFactory.deployed();

        const initialCurrentBatchResult = await electionFactory.currentBatch.call({ from: owner });
        assert.equal(initialCurrentBatchResult.toNumber(), 0, 'After deployment, CurrentBatch should be 0');

        const newElectionResult = await electionFactory.newElection({ from: owner });
        expectEvent.inTransaction(newElectionResult.tx, Election, 'ElectionOpened', { 'chairperson': ElectionFactory.address });
        expectEvent.inLogs(newElectionResult.logs, 'ElectionCreated', { 'chairperson': owner });

        const currentBatchResult = await electionFactory.currentBatch.call({ from: owner });
        assert.equal(currentBatchResult.toNumber(), 1, 'After adding an Election, CurrentBatch should be 1');
    
    });

    // Verify the failer of new Election creation if the previous is not yet closed
    it("New Election cannot be added before the current Election is closed", async () => {
        const electionFactory = await ElectionFactory.deployed();

        const newElectionResult = electionFactory.newElection({ from: owner });
        shouldFail.reverting(newElectionResult);

        const currentBatchResult = await electionFactory.currentBatch.call({ from: owner });
        assert.equal(currentBatchResult.toNumber(), 1, 'CurrentBatch should not change after failed addition of an Election');
    
    });      

    // Check Election closure
    it("Election Factory can close the current Election", async () => {
        const electionFactory = await ElectionFactory.deployed();
        
        const closeElectionResult = await electionFactory.closeCurrentElection({ from: owner });
        expectEvent.inTransaction(closeElectionResult.tx, Election, 'ElectionClosed', { 'chairperson': ElectionFactory.address });

    });

    // Check Election creation after closing the previous  one
    it("Deploying new Election Contract after closing the previous Election", async () => {
        const electionFactory = await ElectionFactory.deployed();
        
        const newElectionResult = await electionFactory.newElection({ from: owner });
        expectEvent.inTransaction(newElectionResult.tx, Election, 'ElectionOpened', { 'chairperson': ElectionFactory.address });
        expectEvent.inLogs(newElectionResult.logs, 'ElectionCreated', { 'chairperson': owner });

        const currentBatchResult = await electionFactory.currentBatch.call({ from: owner });
        assert.equal(currentBatchResult.toNumber(), 2, 'CurrentBatch should be 2 to reflect the 2nd creation of an Election');
    
    });

    // Check the addition of a new Election that is compatible with the current implementation
    // Here the compatible is an independent instance of the Election contract created for the purpose.
    // However, the compatible version could be any contract that has the same method signature as the Election contract
    // This is made for flexibility and upgradability. Such that, new contract implementation of ELection
    //  could be used with ElectionFactory without the need to change ElectionFactory,
    //  if there is no method signature change.
    it("Adding compatible Election after closing the current Election", async () => {
        const electionFactory = await ElectionFactory.deployed();

        await electionFactory.closeCurrentElection({ from: owner });
        
        const newElection = await Election.new({from: alice});

        const compatibleElectionResult = await electionFactory.addElection(newElection.address, { from: owner });
     
        expectEvent.inLogs(compatibleElectionResult.logs, 'ElectionAdded', { 'factoryChairperson' : owner, electionChairperson: alice });
        const currentBatchResult = await electionFactory.currentBatch.call({ from: owner });
        assert.equal(currentBatchResult.toNumber(), 3, 'CurrentBatch should be 3 to reflect the 3nd addition of an Election');
    
    });
});