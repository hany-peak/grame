pragma solidity ^0.4.24;

library SafeMath {
    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool); 
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract BasicToken is ERC20Basic {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    uint256 totalSupply_ ;

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "is not address");
        require(_value <= balances[msg.sender], "not sufficient balance");
		

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
    
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
}

contract Ownable {
    
	address public hidden_supervisor;
    address public supervisor;
	address public owner;
	address public banker;
	address public director1;                 
    address public director2;
    address public director3;
	
    mapping(address => bool) public operator;
    bool public director1_signature;
    bool public director2_signature;
    bool public director3_signature;
    

    event HiddenSupervisorTransferred(address indexed previousHiddenSupervisor, address indexed newHiddenSupervisor);
    event SupervisorTransferred(address indexed previousSupervisor, address indexed newSupervisor);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BankerTransferred(address indexed previousBanker, address indexed newBanker);
    event Director1Transferred(address indexed previousDirector1, address indexed newDirector1);
    event Director2Transferred(address indexed previousDirector2, address indexed newDirector2);
    event Director3Transferred(address indexed previousDirector3, address indexed newDirector3);
    event OperatorSetting(address indexed _newOperator);
	event OperatorDisable(address indexed _newOperator);
	event ClearedCLevelSignature(address _from, uint256 _timestamp);
    constructor() public {
		
        hidden_supervisor = msg.sender;
		supervisor = msg.sender;
        owner = msg.sender;
        banker = msg.sender;
		director1 = msg.sender;
        director2 = msg.sender;
        director3 = msg.sender;
        ClearCLevelSignature();
    }

    modifier onlyHiddenSupervisor() { require(msg.sender == hidden_supervisor); _; }
    modifier onlySupervisor() { require(msg.sender == supervisor); _; }
    modifier onlyOwner() { require(msg.sender == owner); _; }
    modifier onlyBanker() { require(msg.sender == banker); _; }
    modifier CheckOperator { require(operator[msg.sender] != true); _; }
    modifier onlyOwnerOrOperator() { require(msg.sender == owner || operator[msg.sender] == true); _; }
    modifier onlyDirector1() { require(msg.sender == director1); _; }
    modifier onlyDirector2() { require(msg.sender == director2); _; }
    modifier onlyDirector3() { require(msg.sender == director3); _; }
    modifier AllCLevelSignature() { require((director1_signature && director2_signature)||(director1_signature && director3_signature)||(director2_signature && director3_signature)); _; }
    
    modifier onlyNotGrameAdmin(address _from) {

        require(_from != address(0));
        require(_from != hidden_supervisor);
        require(_from != supervisor);
        require(_from != owner);
        require(_from != banker);
        require(_from != director1);
        require(_from != director2);
        require(_from != director3);
        require(operator[_from] != true);
        _;
    } 
    
    function director1Signature() external onlyDirector1 returns(bool) { director1_signature = true; return true;}
    function director2Signature() external onlyDirector2 returns(bool) { director2_signature = true; return true;}
    function director3Signature() external onlyDirector3 returns(bool) { director3_signature = true; return true;}
    
	function transferHiddenSupervisor(address _newHiddenSupervisor) external 
    onlyHiddenSupervisor onlyNotGrameAdmin(_newHiddenSupervisor) 
    returns(bool) {
		
        emit HiddenSupervisorTransferred(hidden_supervisor, _newHiddenSupervisor);
		
        hidden_supervisor = _newHiddenSupervisor;

        return true;
    }
	
	
    
    function transferSupervisor(address _newSupervisor) external 
    onlyHiddenSupervisor onlyNotGrameAdmin(_newSupervisor) 
    returns (bool) {

        emit SupervisorTransferred(supervisor, _newSupervisor);
        
        supervisor = _newSupervisor;
        
        return true;
    }
    
    function transferBankOwner(address _newBanker) external 
    onlySupervisor onlyNotGrameAdmin(_newBanker) 
    returns (bool) {
        
        emit BankerTransferred(banker, _newBanker);
        
        banker = _newBanker;
        
        return true;
    }

    function transferOwnership(address _newOwner) external 
    onlySupervisor onlyNotGrameAdmin(_newOwner)
    returns (bool) {
		
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;

        return true;
    }
  

    function transferDirector1(address _newDirector1) external 
    onlySupervisor onlyNotGrameAdmin(_newDirector1) 
    returns (bool) {
		
        ClearCLevelSignature();
        
        emit Director1Transferred(director1,_newDirector1);
        
        director1 = _newDirector1;

        return true;
    }

    function transferDirector2(address _newDirector2) external 
    onlySupervisor onlyNotGrameAdmin(_newDirector2) 
    returns (bool) {
		
        ClearCLevelSignature();
        
        emit Director2Transferred(director2,_newDirector2);
        
        director2 = _newDirector2;

        return true;
    }

    function transferDirector3(address _newDirector3) external 
    onlySupervisor onlyNotGrameAdmin(_newDirector3)
    returns (bool) {
		
		ClearCLevelSignature();
        
        emit Director3Transferred(director3, _newDirector3);
        
        director3 = _newDirector3;

        return true;
    }

    function SignatureInvalidity() external onlyOwnerOrOperator returns(bool) {
        ClearCLevelSignature();

        return true;
    }

    function ClearCLevelSignature() internal {
        director1_signature = false;
        director2_signature = false;
        director3_signature = false;

        emit ClearedCLevelSignature(msg.sender, block.timestamp);
    }
    
    function setOperator(address _newOperator) external 
    onlySupervisor onlyNotGrameAdmin(_newOperator) 
    returns (bool) {
        
        emit OperatorSetting(_newOperator);
        operator[_newOperator] = true;

        return true;	
    }

    function disableOperator(address _toDeleteOperator) external 
    onlySupervisor returns (bool) {
        
        require(operator[_toDeleteOperator] == true,"is not operator");
        
        emit OperatorDisable(_toDeleteOperator);
        
        operator[_toDeleteOperator] = false;

        return true;
    } 
}

contract BlackList is Ownable {

    event Lock(address indexed LockedAddress);
    event Unlock(address indexed UnLockedAddress);

    mapping( address => bool ) public blackList;

    modifier CheckBlackList { 
      require(blackList[msg.sender] != true); 
      _; 
    }
    
    //블랙리스팅
    function setLockAddress(address _lockAddress) external onlyOwnerOrOperator returns (bool) {
        require(_lockAddress != address(0));
        require(_lockAddress != owner);
        require(blackList[_lockAddress] != true);
        
        blackList[_lockAddress] = true;
        
        emit Lock(_lockAddress);

        return true;
    }

    function unLockAddress(address _unlockAddress) external onlyOwnerOrOperator returns (bool) {
        require(blackList[_unlockAddress] != false);
        
        blackList[_unlockAddress] = false;
        
        emit Unlock(_unlockAddress);

        return true;
    }
}
// ----------------------------------------------------------------------------
// @title Pausable
// @dev Base contract which allows children to implement an emergency stop mechanism.
// ----------------------------------------------------------------------------
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    modifier whenNotPaused() { require(!paused); _; }
    modifier whenPaused() { require(paused); _; }

    function pause() public 
    onlyOwnerOrOperator whenNotPaused 
    returns (bool) {
        
        emit Pause();
        paused = true;

        return true;
    }

    function unpause() public 
    onlyOwnerOrOperator whenPaused  
    returns (bool) {
        
        emit Unpause();
        paused = false;

        return true;
    }
}

contract StandardToken is ERC20, BasicToken, Ownable {
  
    mapping (address => mapping (address => uint256)) internal allowed;

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_to != supervisor);
        require(_to != hidden_supervisor);
        require(_from != address(0));
        require(_from != supervisor);
        require(_from != hidden_supervisor);
        
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    
        emit Transfer(_from, _to, _value);
    
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;    
        emit Approval(msg.sender, _spender, _value);
    
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function increaseApproval(address _spender, uint256 _addedValue) public returns (bool) {
        
        allowed[msg.sender][_spender] = (allowed[msg.sender][_spender].add(_addedValue));
		
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    
        return true;
    }

    function decreaseApproval(address _spender, uint256 _subtractedValue) public returns (bool) {
        uint256 oldValue = allowed[msg.sender][_spender];
    
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
    
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
}

contract MultiTransferToken is StandardToken {
    
    function multiTransfer(address[] _to, uint256[] _amount) public onlyOwner returns (bool) {
        
        require(_to.length == _amount.length);
        require(msg.sender != supervisor);
        require(msg.sender != hidden_supervisor);
		
		
        uint256 ui;
        uint256 amountSum = 0;
    
        for (ui = 0; ui < _to.length; ui++) {
            require(_to[ui] != address(0));
            require(_to[ui] != supervisor);
            require(_to[ui] != hidden_supervisor);

            amountSum = amountSum.add(_amount[ui]);
        }

        require(amountSum <= balances[msg.sender]);

        for (ui = 0; ui < _to.length; ui++) {
            balances[msg.sender] = balances[msg.sender].sub(_amount[ui]);
            balances[_to[ui]] = balances[_to[ui]].add(_amount[ui]);
        
            emit Transfer(msg.sender, _to[ui], _amount[ui]);
        }
    
        return true;
    }
    
}

contract BankerTransferToken is StandardToken {

    uint public unlockDate;
    event SetSendTime(uint toAddTime, uint resultTime, address _who);

	function setSendTime(uint _value) external onlyBanker returns(bool) {
	    ClearCLevelSignature();
        unlockDate  = now + _value;

        emit SetSendTime(_value, unlockDate, msg.sender);

        return true;
    }
    function getSendTime() external onlyBanker view returns (uint){
        return unlockDate;
    }

    function transferBanker(address _to, uint256 _value) external AllCLevelSignature returns (bool) {
	      
        require(_to == owner);
        require(now <= unlockDate);
        require(msg.sender != supervisor);
        require(msg.sender != hidden_supervisor);
        require(_to != supervisor);
        require(_to != hidden_supervisor);
        require(_value <= balances[msg.sender]);

        ClearCLevelSignature();
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        unlockDate = now;
        emit Transfer(msg.sender, _to, _value);
        
        return true;
    }
}

contract BurnableToken is StandardToken {

    event BurnAdminAmount(address indexed burner, uint256 value);
    event BurnHackerAmount(address indexed hacker, uint256 hackingamount, string reason);

    function burnAdminAmount(uint256 _value) public 
    onlyOwner returns (bool) {
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
    
        emit BurnAdminAmount(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);

        return true;
    }
    
    function burnHackingAmount(address _hackerAddress, string _reason) public onlyOwner AllCLevelSignature  returns (bool) {
        ClearCLevelSignature();

        uint256 hackerAmount =  balances[_hackerAddress];
        
        require(hackerAmount > 0);

        balances[_hackerAddress] = balances[_hackerAddress].sub(hackerAmount);
        totalSupply_ = totalSupply_.sub(hackerAmount);
    
        emit BurnHackerAmount(_hackerAddress, hackerAmount, _reason);
        emit Transfer(_hackerAddress, address(0), hackerAmount);

        return true;
    }
}

contract PausableToken is StandardToken, Pausable, BlackList {
    event LockerSetting(address indexed _address, uint256 amount);
    event Recall(address indexed _address, uint256 amount);
    mapping(address => uint256) public locker;
    
    function transfer(address _to, uint256 _value) public whenNotPaused CheckBlackList returns (bool) {
        require(_to != supervisor);
        require(_to != hidden_supervisor);
        require(msg.sender != banker);
        require(msg.sender != supervisor);
        require(msg.sender != hidden_supervisor);

        require(balanceOf(msg.sender) - _value >= lockerOf(msg.sender));
        
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused CheckBlackList returns (bool) {
		require(_from != banker);
        
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public whenNotPaused CheckBlackList returns (bool) {
        require(msg.sender != banker);
        require(balanceOf(msg.sender) - _value >= lockerOf(msg.sender));
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue) public whenNotPaused CheckBlackList returns (bool success) {
		    require(msg.sender != banker);
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public whenNotPaused CheckBlackList returns (bool success) {
		    require(msg.sender != banker);
        return super.decreaseApproval(_spender, _subtractedValue);
    }
    
    function lockerOf(address _address) public view returns (uint256 _locker) {
		    return locker[_address];
	  }

    function locker() public view returns (uint256 _locker) {
        return locker[msg.sender];
    }
	
    function setLock(address _address, uint256 _value) public onlyOwner 
    returns (bool) {
        require(_value <= totalSupply_, "value is greater than totalSupply_");
        require(_address != address(0), "is not address");

        locker[_address] = _value;
        emit LockerSetting(_address, _value);

        return true;
	  }
	
	function recall(address _from, uint256 _amount) public onlyOwner 
    returns (bool) {
        require(_from != address(0));
        require(_amount > 0);
        
        uint256 currentLocker = lockerOf(_from);
        uint256 currentBalance = balanceOf(_from);
        
        require(currentLocker >= _amount, "is not sufficient currentLocker");
        require(currentBalance >= _amount, "is not sufficient currentBalance");
        
        uint256 newLock = currentLocker - _amount;
        locker[_from] = newLock;
        emit LockerSetting(_from, newLock);
        
        balances[_from] = balances[_from].sub(_amount);
        balances[owner] = balances[owner].add(_amount);
        emit Transfer(_from, owner, _amount);
        emit Recall(_from, _amount);

        return true;
      }

      function multiLock(address[] _to, uint256[] _amount) public onlyOwner returns (bool) {
          
          require(_to.length == _amount.length, "is not equal length");
          
          uint256 ui;
          
          for (ui = 0; ui < _to.length; ui++) {
            require(_amount[ui] <= totalSupply_, "value is greater than totalSupply_");
            require(_to[ui] != address(0), "is not address");
            locker[_to[ui]] = _amount[ui];
            emit LockerSetting(_to[ui], _amount[ui]);
          }
          
          return true;
      }
}

contract DetailedERC20 is ERC20 {
	string public name;
	string public symbol;
	uint256 public decimals;
	
	constructor(string _name, string _symbol, uint256 _decimals) public {
		name = _name;
		symbol = _symbol;
		decimals = _decimals;
	}
}

contract GrameCoin is PausableToken, DetailedERC20, BankerTransferToken, BurnableToken, MultiTransferToken {
    string public constant name = "Grame";
    string public constant symbol = "GRM";
    uint256 public constant decimals = 18;
    
    uint256 public constant TOTAL_SUPPLY = (1e10) * (10 ** uint256(decimals)); 
    
    
    constructor() DetailedERC20(name, symbol, decimals) public {
		totalSupply_ = TOTAL_SUPPLY;
		balances[owner] = totalSupply_;
		emit Transfer(address(0x0), owner, totalSupply_);
	}
	
	function() public payable {
	   revert();
	 }
}