pragma solidity ^0.5.0;

import "./ElectionBase.sol";
import "./Election.sol";

/// @title Generates and keeps tracking of Elections smart contracts.
/// @notice The chairperson of the factory is responsible of creating 
/// and adding the Elections smart contracts.
/// @dev The chairperson, in this contract, could be different from 
/// the chairperson of each election.

contract ElectionFactory is ElectionBase {
    uint public currentBatch = 0; // Default is 0. But, setting it to 0 is just to make a clearer code
    
    mapping (uint => address) public elections;
    
    event ElectionCreated(address indexed chairperson);
    event ElectionAdded(address indexed factoryChairperson, address indexed electionChairperson);
    
    /// @notice enforce running only one election at a time
    modifier latestElectionClosed() {
        if(currentBatch != 0)
            require(Election(elections[currentBatch]).closed(),
                "Starting new Election requires that the previous is closed");
        _;
    }

    constructor() ElectionBase() public {
    }
    
    function newElection() 
        public 
        onlyChairperson
        whenNotPaused
        latestElectionClosed
    {
        currentBatch++;
        Election election = new Election();
        elections[currentBatch] = address(election);
        emit ElectionCreated(chairperson);
    }
    
    /// @notice This is used if the Chairperson is willing to add a contract that is
    /// deffirent from the current one, but compatible with it.
    /// @dev This method is added to allow for upgreadablity. If a new version of Election contract is impelmented, 
    /// the new Election contract implemenation has to be compatible with the current one.
    function addElection(address _electionContract) 
        public 
        onlyChairperson
        whenNotPaused
        latestElectionClosed
    {
        currentBatch++;
        elections[currentBatch] = _electionContract;
        emit ElectionAdded(chairperson, Election(_electionContract).chairperson());
    }
    
    /// @notice This is just a wrapper functions because elections 
    /// could be also closed by directly calling 'close()'
    /// at the Election smart contract.
    /// @dev This funciton will revert if the current Election's chairperson 
    /// is not the same as the factory chairperson.
    function closeCurrentElection() public onlyChairperson whenNotPaused {
        // No need to put require(currentBatch !=0) because exction will fail then in all ways.
        Election(elections[currentBatch]).close();
    }
}