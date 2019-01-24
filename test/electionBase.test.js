// This file tests the ElectionBase smart contract  that is 
//  the base contract for both Election and ElectionFactory. 
// It covers checking the initial chairperson. And it checks that
//  updating chairperson can happen only by the owner.
// In addition, it tests the circuit-breaker when trying to update 
//  the chairperson.
// It also checks the emitted event 'ChairpersonChanged'.

const { shouldFail } = require('openzeppelin-test-helpers');

const ElectionBase = artifacts.require("./ElectionBase.sol");

contract('ElectionBase', function (accounts) {

  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  // This will check the initial value of the chairperson
  it("At deployment, the deployer has to be set as the Chairperson", async () => {
    const election = await ElectionBase.deployed();

    const chairperson = await election.chairperson.call({ from: owner });
    assert.equal(chairperson, owner, 'Chairperson has not been set to be the deployer');

  });

  // This will check that the chairperson could be changed
  // And will check that the associated event is emitted with the correct arguments
  it("The Chairperson should be updatable", async () => {
    const election = await ElectionBase.deployed();

    const result = await election.changeChairperson(alice, { from: owner });

    const chairperson = await election.chairperson.call({ from: owner });
    assert.equal(chairperson, alice, 'Chairperson has not been updated');

    const expectedEventResult = { previousChairperson: owner, newChairperson: alice };

    const logPreviousChairperson = result.logs[0].args.previousChairperson;
    const logNewChairperson = result.logs[0].args.newChairperson;

    // Check 2 arguments of the emitted event ChairpersonChanged:
    assert.equal(expectedEventResult.previousChairperson, logPreviousChairperson, "ChairpersonChanged event previousChairperson property not emitted, check deposit method");
    assert.equal(expectedEventResult.newChairperson, logNewChairperson, "ChairpersonChanged event newChairperson property not emitted, check deposit method");
  });

  // This will check that trying to update the chairperson, by
  //  anyone other than the owner, will cause a 'revert'.
  it("The Chairperson should not be updated by anyone other than the owner", async () => {
    const election = await ElectionBase.deployed();
    // 'shouldFail' is from openzeppelin-test-helpers. 
    // It internally checks the revert through try-catch.
    await shouldFail.reverting(election.changeChairperson(bob, { from: alice }));
  });

  // Check the circuit-breaker 
  it("Calling 'pause' should pause excution at ElectionBase", async () => {
    const election = await ElectionBase.deployed();
    await election.pause({ from: owner });
    await shouldFail.reverting(election.changeChairperson(bob, { from: owner }));
  });

  // Check the ability to resume after circuit-breaker 
  it("Unpause should allow excution again on ElectionBase", async () => {
    const election = await ElectionBase.deployed();
    await election.unpause({ from: owner });
    await election.changeChairperson(bob, { from: owner });

    const chairperson = await election.chairperson.call({ from: owner });
    assert.equal(chairperson, bob, 'Chairperson is not been able to be updated after unpause');
  });
});