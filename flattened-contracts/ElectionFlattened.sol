pragma solidity ^0.5.0;

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor () internal {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @return the address of the owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * @notice Renouncing to ownership will leave the contract without an owner.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: openzeppelin-solidity/contracts/access/Roles.sol

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    struct Role {
        mapping (address => bool) bearer;
    }

    /**
     * @dev give an account access to this role
     */
    function add(Role storage role, address account) internal {
        require(account != address(0));
        require(!has(role, account));

        role.bearer[account] = true;
    }

    /**
     * @dev remove an account's access to this role
     */
    function remove(Role storage role, address account) internal {
        require(account != address(0));
        require(has(role, account));

        role.bearer[account] = false;
    }

    /**
     * @dev check if an account has this role
     * @return bool
     */
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0));
        return role.bearer[account];
    }
}

// File: openzeppelin-solidity/contracts/access/roles/PauserRole.sol

contract PauserRole {
    using Roles for Roles.Role;

    event PauserAdded(address indexed account);
    event PauserRemoved(address indexed account);

    Roles.Role private _pausers;

    constructor () internal {
        _addPauser(msg.sender);
    }

    modifier onlyPauser() {
        require(isPauser(msg.sender));
        _;
    }

    function isPauser(address account) public view returns (bool) {
        return _pausers.has(account);
    }

    function addPauser(address account) public onlyPauser {
        _addPauser(account);
    }

    function renouncePauser() public {
        _removePauser(msg.sender);
    }

    function _addPauser(address account) internal {
        _pausers.add(account);
        emit PauserAdded(account);
    }

    function _removePauser(address account) internal {
        _pausers.remove(account);
        emit PauserRemoved(account);
    }
}

// File: openzeppelin-solidity/contracts/lifecycle/Pausable.sol

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is PauserRole {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor () internal {
        _paused = false;
    }

    /**
     * @return true if the contract is paused, false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(_paused);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyPauser whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyPauser whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

// File: contracts/ElectionBase.sol

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

// File: contracts/Election.sol

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
