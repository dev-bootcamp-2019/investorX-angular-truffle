# Known Attacks
Bellow are the measures took to ensure that invesotX smart contracts are not susceptible to common attacks.

## Reentrancy
Reentrancy attack is made impossible to happen in InvestorX smart contracts. This is because there is no usage of `call` or `delegatecall`on a method specified by the sender.
 
## Front Running (AKA Transaction-Ordering Dependence)
The order of a transaction cannot play a significant role at investorX logic. Actually, the only possible related case is when the chairperson chose to close an Election. In this case, some voters can know that and try to vote before the Election is closed, by submitting a transaction with a significantly higher price to ensure his/here voting to happen before the Election closure. This case would not actually have any bad effect on the Election process. Because having more voters at the before the closure does not interduce and bad decision. Since the reward of the voters is supposed to be distributed (by some Oracle(s) that is not implemented yet) after an announced period of the Election closure, not the Election open. i.e the calculation of the ROI should be done by comparing the value difference between the Election closure and some pre-announced (3 months for example).

## Timestamp Dependence
There is no calculation that depends on the timestamp. And all time and value calculations are supposed to be made off-chain by some Oracle(s) (not implemented yet).

## Integer Overflow and Underflow
There is no possible overflow or underflow in investorX smart contracts.

## DoS with (Unexpected) revert
There is no payment implemented on-chain that can cause a function to revert if it was not possible to be made.

## DoS with Block Gas Limit
Loops with an undetermined number of iterations, and other possible causes of DoS with Block Gas Limit attacks are not implemented in investorX. There is no unbounded-operations, actions that are required to be within-a-certain-time-period, or a usage of `call` or `delegatecall`. As `call` and `delegatecall` could expose the code to insufficient-gas-griefing, in some cases.

## Forcibly Sending Ether to a Contract
The logic, inside investorX smart contracts, does not revert in any case that is dependant on the balance of the contract being 0.