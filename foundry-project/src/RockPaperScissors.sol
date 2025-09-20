// contracts/src/CoinFlip.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract RockPaperScissors is IEntropyConsumer {
    error NotEnoughEtherSent();
    event ChoiceRequested(uint64 sequenceNumber);
    event ChoiceResult(uint64 sequenceNumber, uint result);

    uint constant COST_PER_GAME = 0.001 ether;

    address payable sponsor;

    mapping(address => uint256) public ticketBalance;

    modifier onlySponsor() {
        require(msg.sender == sponsor, "not sponsor");
        _;
    }

    IEntropyV2 entropy;

    constructor(address _entropy, address payable _sponsor) {
        entropy = IEntropyV2(_entropy);
        sponsor = _sponsor;
    }

    function buyTickets(uint _numTickets) external payable {
        if (msg.value < _numTickets * COST_PER_GAME) {
            revert NotEnoughEtherSent();
        }

        (bool sent, ) = sponsor.call{value: msg.value}("");
        require(sent, "failed");

        ticketBalance[msg.sender] += _numTickets;
    }

    // This method is required by the IEntropyConsumer interface
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function request(address _player) external payable onlySponsor {
        // get the required fee
        uint128 requestFee = entropy.getFeeV2();
        // check if the user has sent enough fees
        if (msg.value < requestFee) revert("not enough fees");

        // pay the fees and request a random number from entropy
        uint64 sequenceNumber = entropy.requestV2{value: requestFee}();
        ticketBalance[_player] -= 1;

        // emit event
        emit ChoiceRequested(sequenceNumber);
    }

    function entropyCallback(
        uint64 sequenceNumber,
        address,
        bytes32 randomNumber
    ) internal override {
        uint result = uint256(randomNumber) % 3;

        emit ChoiceResult(sequenceNumber, result);
    }

    receive() external payable {}
    fallback() external payable {}
}
