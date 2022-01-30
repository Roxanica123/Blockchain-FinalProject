// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./SafeMath.sol";

contract MarketplaceToken {
    using SafeMath for uint256;
    
    string public name = "MarketplaceToken";
    string public symbol = "MPK";

    uint256 public totalSupply;
    
    event Transfer(address indexed _from,
                   address indexed _to,
                   uint256 _value);

    event Approval(address indexed _owner,
                   address indexed _spender,
                   uint256 _value);

    mapping (address => uint256) public balanceOf;
    mapping (address => mapping(address => uint256)) public allowance;

    uint8 private _decimals;

    constructor () {
        totalSupply = 0;
        _decimals = 18;
        _mint(address(this), 1000);
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        _approve(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        _transfer(_from, _to, _value);
        _approve(_from, msg.sender, allowance[_from][msg.sender].sub(_value));
    
        return true;
    }

    function buyTokens(address recipient, uint256 amount) payable public returns(bool){
        this.approve(recipient, amount);
        return transferFrom(address(this), recipient, amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {

        balanceOf[sender] = balanceOf[sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        allowance[owner][spender] = amount;
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        totalSupply = totalSupply.add(amount);
        balanceOf[account] = balanceOf[account].add(amount);
    }
}
