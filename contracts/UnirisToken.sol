pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract UnirisToken is ERC20 {

  /* TOKEN ERC20 PROPERTIES */

  string constant NAME = "UnirisToken";
  string constant SYMBOL = "UCO";
  uint8 constant DECIMALS = 18;

  /* TOKEN DISTRIBUTION */

  // 8.2% for the private sale
  uint256 public constant private_sale_supply = 820000000000000000000000000;
  // 30% for the public sale
  uint256 public constant public_sale_supply = 3000000000000000000000000000;
  // 23.6% for the deliverables
  uint256 public constant deliverable_supply = 2360000000000000000000000000;
  // 14.6% for the network pool
  uint256 public constant network_pool_supply = 1460000000000000000000000000;
  // 9% for the enhancements
  uint256 public constant enhancement_supply = 900000000000000000000000000;
  // 5.6% for the team
  uint256 public constant team_supply = 560000000000000000000000000;
  //3.4% for the Exch. Pool
  uint256 public constant exch_pool_supply = 340000000000000000000000000;
  //3.4% for the marketing
  uint256 public constant marketing_supply = 340000000000000000000000000;
  //2.2% for the foundation
  uint256 public constant foundation_supply = 220000000000000000000000000;

  /* BENIFICIARIES */

  address public private_sale_beneficiary;
  address public public_sale_beneficiary;
  address public deliverables_beneficiary;
  address public network_pool_beneficiary;
  address public enhancement_beneficiary;
  address public team_beneficiary;
  address public exch_pool_beneficiary;
  address public marketing_beneficiary;
  address public foundation_beneficiary;

  /* VESTING */

  //End date of the vesting period (in seconds) //2 years
  uint256 public vesting_end_date;
  //How many percent we can release per year during the vesting period
  uint8 public release_yearly_rate;
  //Cliff vesting period to prevent transfer except for public sale beneficiaries (in seconds)
  uint256 public cliff_end_date; //0 year

  uint256 constant seconds_per_years = 31556952;
  uint8 private vesting_years;

  struct yearly_release {
    uint256 start_with;
    uint256 amount;
  }

  mapping(address => mapping(uint8 => yearly_release)) public releases;

  constructor(
    address _private_sale_beneficiary,
    address _public_sale_beneficiary,
    address _deliverables_beneficiary,
    address _network_pool_beneficiary,
    address _enhancement_beneficiary,
    address _team_beneficiary,
    address _exch_pool_beneficiary,
    address _marketing_beneficiary,
    address _foundation_beneficiary,
    uint256 _vesting_end_date,
    uint256 _cliff_end_date,
    uint8 _release_yearly_rate) public {

    require(_private_sale_beneficiary != address(0), "Invalid private sale beneficiary address");
    require(_public_sale_beneficiary != address(0), "Invalid public sale beneficiary address");
    require(_deliverables_beneficiary != address(0), "Invalid deliverables beneficiary address");
    require(_network_pool_beneficiary != address(0), "Invalid network pool beneficiary address");
    require(_enhancement_beneficiary != address(0), "Invalid enhancement beneficiary address");
    require(_team_beneficiary != address(0), "Invalid team beneficiary address");
    require(_exch_pool_beneficiary != address(0), "Invalid exch pool beneficiary address");
    require(_marketing_beneficiary != address(0), "Invalid marketing beneficiary address");
    require(_foundation_beneficiary != address(0), "Invalid foundation beneficiary address");

    require(_vesting_end_date > now, "Vesting end date must be in the future");
    require(_cliff_end_date > now && _cliff_end_date < _vesting_end_date, "Cliff end date must in the future and before the vesting end date");
    require(_release_yearly_rate > 0, "Release yearly rate must be greater than 0");

    private_sale_beneficiary = _private_sale_beneficiary;
    public_sale_beneficiary = _public_sale_beneficiary;
    deliverables_beneficiary = _deliverables_beneficiary;
    network_pool_beneficiary = _network_pool_beneficiary;
    enhancement_beneficiary = _enhancement_beneficiary;
    team_beneficiary = _team_beneficiary;
    exch_pool_beneficiary = _exch_pool_beneficiary;
    marketing_beneficiary = _marketing_beneficiary;
    foundation_beneficiary = _foundation_beneficiary;

    vesting_end_date = _vesting_end_date;
    cliff_end_date = _cliff_end_date;
    release_yearly_rate = _release_yearly_rate;
    vesting_years = uint8(_vesting_end_date.sub(now).div(seconds_per_years));

    _mint(private_sale_beneficiary, private_sale_supply);
    _mint(public_sale_beneficiary, public_sale_supply);
    _mint(deliverables_beneficiary, deliverable_supply);
    _mint(network_pool_beneficiary, network_pool_supply);
    _mint(enhancement_beneficiary, enhancement_supply);
    _mint(team_beneficiary, team_supply);
    _mint(exch_pool_beneficiary, exch_pool_supply);
    _mint(marketing_beneficiary, marketing_supply);
    _mint(foundation_beneficiary, foundation_supply);
  }

  function transfer(address to, uint256 value) public returns (bool) {
    //Only private sale beneficiary can do direct transfer during the vesting period ignoring the cliff period
    if (msg.sender != private_sale_beneficiary && now < vesting_end_date) {
      releaseAndTransfer(msg.sender, to, value);
    } else {
      super.transfer(to, value);
    }
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    //Only approved address from the spent public sale beneficiary are allowed to be transfered
    //during the vesting period ignoring the cliff period
    if (from == public_sale_beneficiary) {
      super.transferFrom(from, to, value);
    }
    else {
      //Only private sale beneficiary can do direct transfer during the vesting period ignoring the cliff period
      if (from != private_sale_beneficiary && now < vesting_end_date) {
        releaseAndTransferFrom(from, to, value);
      } else {
        super.transferFrom(from, to, value);
      }
    }
  }

  function releaseAndTransfer(address from, address to, uint256 value) internal returns (bool) {
    checkAndUpdateRelease(from, value);
    super.transfer(to, value);
  }

  function releaseAndTransferFrom(address from, address to, uint256 value) internal returns (bool) {
    require(value <= balanceOf(from), "Account does not hold this amount of token");
    require(value <= allowance(from, msg.sender), "Sender not allowed to release and transfer this amount of tokens");
    checkAndUpdateRelease(from, value);
    super.transferFrom(from, to, value);
  }

  function checkAndUpdateRelease(address from, uint256 value) internal {
    require(from != address(0), "Invalid releasing address");
    require(value > 0, "Invalid release value");
    require(now > cliff_end_date, "Cliff period is not reached yet");
    uint256 tokenAmount = balanceOf(from);
    require(tokenAmount > 0, "unsufficent tokens");

    if (vesting_end_date > now) {
      uint256 remaining_vesting_period = vesting_end_date.sub(now);
      uint8 remaining_vesting_years = uint8(remaining_vesting_period.div(seconds_per_years));

      yearly_release storage current_year_release = releases[from][vesting_years - remaining_vesting_years];

      //When it's the first release for this year
      if (current_year_release.amount == 0) {
        current_year_release.start_with = tokenAmount;
        //Check if the amount desired if less than 20% for the current balance
        require(value < tokenAmount.mul(release_yearly_rate).div(100), "Cannot release more than the yearly release rate");
      }
      else {
        //Check if the amount desired if less than the 20% from the yearly balance
        require(current_year_release.amount.add(value) < current_year_release.start_with.mul(release_yearly_rate).div(100), "Cannot release more than the yearly release rate");
      }

      current_year_release.amount = current_year_release.amount.add(value);
    }

  }

}