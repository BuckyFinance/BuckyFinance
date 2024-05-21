// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20Burnable, ERC20 } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract DSC is ERC20Burnable, Ownable {
    error DSC__AmountMustBeMoreThanZero();
    error DSC__BurnAmountExceedsBalance();
    error DSC__NotZeroAddress();

    constructor() ERC20("DSC", "DSC") Ownable(msg.sender) {

    }

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0){
            revert DSC__AmountMustBeMoreThanZero();
        }
        if (balance < _amount){
            revert DSC__BurnAmountExceedsBalance();
        }
        super.burn(_amount);
    }

    function mint(address _to, uint256 _amount) external onlyOwner returns (bool){
        if (_to == address(0)){
            revert DSC__NotZeroAddress();
        }

        if (_amount <= 0){
            revert DSC__AmountMustBeMoreThanZero();
        }

        _mint(_to, _amount);
        return true;
    }
}
