pragma solidity ^0.5.0;

import "./ElectionBase.sol";

/// @title Election
/// @notice Assumptions: A voter can vote for more than one guru wallet. 
/// However, the voter cannot vote for the same guru wallet more than once.
/// And the given vote cannot be undone (this can be changed easily if needed).
contract Election is ElectionBase {
    
    /// @notice Election is opened once the contract is deployed
    bool public closed = false;
    
    /// @dev The key of the mapping is the address (wallet) of a guru.
    mapping (address => Guru) public gurus;
    
    /// @dev An array is used to be able to iterate over all gurus.
    address[] public gurusArray;
    
    event ElectionOpened(address indexed chairperson);
    event GuruAdded(address indexed wallet, bytes32 name, address indexed addedBy);
    event Voted(address indexed guruWallet, address indexed voter);
    event ElectionClosed(address indexed chairperson);
    
    modifier electionOpened() {
        require(closed == false);
        _;
    }
    
    struct  Guru {
        /// @dev Bytes32 is used to store the name because it consumes less gas
        bytes32 name; 
        mapping(address => bool) voters;
        address[] votersList; //Save only the positive votes. So 'votersList.length' is the votes count.
        
        //'arrayIndex' is useful if delete a guru wallet is required (with the ability to iterate on all gurus wallets).
        uint arrayIndex; //Index of the address of the guru wallet inside 'gurusArray'
    }

    constructor() ElectionBase() public {
        emit ElectionOpened(msg.sender);
    }

    function close() public onlyChairperson whenNotPaused {
        emit ElectionClosed(msg.sender);
        closed = true;
    }
        
    function getGurusCount() public view returns (uint) {
        return gurusArray.length;
    }

    /// @notice Chairperson can add any guru
    /// @dev The modfiers whenNotPaused & electionOpened are called
    /// inside the sub-fuction _addGuru
    function addGuru(bytes32 _name, address _wallet) public onlyChairperson {
        require(_wallet != address(0x0));
        _addGuru(_name, _wallet);
    }

    /// @notice Receiving applications to become an investment guru
    /// Anyone can add himself as an investment guru 
    /// @dev The modfier whenNotPaused is used inside the sub fuction _addGuru
    function beGuru(bytes32 _name) public {
        _addGuru(_name, msg.sender);
    }
    
    /// @notice Only doable if election is not closed.
    function _addGuru(bytes32 _name, address _wallet) private electionOpened whenNotPaused {
        require(_name != 0);
        require(gurus[_wallet].name == 0); //y has not been added early.
        
        emit GuruAdded(_wallet, _name, msg.sender);
        
        gurus[_wallet].name = _name;
        gurus[_wallet].arrayIndex = gurusArray.push(_wallet) - 1;
    }

    function vote(address _wallet) public electionOpened whenNotPaused {
        require(gurus[_wallet].name != 0); //guru should be exist
        require(gurus[_wallet].voters[msg.sender] == false); //The voter has not already voted
        
        emit Voted(_wallet, msg.sender);
        
        gurus[_wallet].voters[msg.sender] = true;
        gurus[_wallet].votersList.push(msg.sender);
    }
    
    function getVotesCount(address _wallet) public view returns (uint) {
        return gurus[_wallet].votersList.length;
    }
    
    function isElectedBy(address _guruWallet, address _voterWallet) public view returns (bool) {
        return gurus[_guruWallet].voters[_voterWallet];
    }

}
