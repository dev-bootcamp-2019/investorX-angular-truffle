pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/// @title Common base for Election and ElectionFactory contracts
contract ElectionBase is Ownable, Pausable {
    
    /// @dev Could be another smart contract where the logic is written instead of being controlled by a human.
    address public chairperson; 
    
    event ChairpersonChanged(address indexed previousChairperson, address indexed newChairperson);
  
    modifier onlyChairperson() {
        require(msg.sender == chairperson);
        _;
    }
    
    constructor() public Ownable()  {
        chairperson = msg.sender;
    }
    
    function changeChairperson(address _chairperson) public onlyOwner whenNotPaused {
        require(_chairperson != address(0));
        emit ChairpersonChanged(chairperson, _chairperson);
        chairperson = _chairperson;
    }
}