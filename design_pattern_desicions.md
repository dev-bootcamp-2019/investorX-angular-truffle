# Design Decisions

The following design decision has been implemented at investorX:

## Fail early and fail loud
All functions check the condition required for execution as early as possible in the function body and throw an exception if the condition is not met. This is also a good practice to reduce unnecessary code execution in the event that an exception will be thrown. In investorX smart contracts, all fail-conditions are pre-checked either using modifiers or on the top of the function as a precondition to continue the execution flow.

## Restricting Access
All administrative methods are restricted to only the designated users. For example, the circuit-breaker is restricted to the owner by the modifier `onlyOwner`. And closing an Election or creating a new Election at the Election Factory is restricted to chairperson by the modifier `onlyChairperon`.

## Circuit Breaker
The circuit breaker is implemented by inheriting from [Pausable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol "Pausable.sol") smart contract available at [OpenZeppelin Solidity](https://github.com/OpenZeppelin/openzeppelin-solidity). If the `pause()` was called, all functions that change the smart contract state will stop functioning. Technically speaking, all functions that do not have the `view` modifier will `revert` if it is called when the smart contract is `paused`.

## State Machine
At the Election Factory smart contract, it is not possible to add/open a new Elections if there is an ongoing election that is not closed. Only after closing the current election, a new election could be opened/added.

## Factory Contract
The Election Factory smart contract is used for creating and controlling the Election smart contracts as child contracts; And, it stores their addresses. 