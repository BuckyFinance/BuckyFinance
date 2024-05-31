pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {IRouterClient, WETH9, LinkToken, BurnMintERC677Helper} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {Depositor} from "../../src/Depositor.sol";
import {MainRouter} from "../../src/MainRouter.sol";
import {Minter} from "../../src/Minter.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {DSC} from "../../src/DSC.sol";
import {MockV3Aggregator} from "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";


contract Demo is Test {
    CCIPLocalSimulator public ccipLocalSimulator;
    uint64 chainSelector;
    IRouterClient sourceRouter;
    IRouterClient destinationRouter;
    WETH9 wrappedNative;
    LinkToken linkToken;
    BurnMintERC677Helper ccipBnM;
    BurnMintERC677Helper ccipLnM;
    Depositor depositor;
    Minter minter;
    MainRouter mainRouter;
    DSC dsc;
    MockV3Aggregator wethMockAggregator;
    MockV3Aggregator wbtcMockAggregator;
    

    address public constant functionsRouter = address(0);
    bytes32 public constant donId = bytes32(0);

    ERC20Mock public weth;
    ERC20Mock public wbtc;

    address public user = makeAddr("user");



    function setUp() public {
        ccipLocalSimulator = new CCIPLocalSimulator();

        (
            chainSelector,
            sourceRouter,
            destinationRouter,
            wrappedNative,
            linkToken,
            ccipBnM,
            ccipLnM
        ) = ccipLocalSimulator.configuration();

        mainRouter = new MainRouter(chainSelector, address(destinationRouter), functionsRouter, donId);
        depositor = new Depositor(chainSelector, address(sourceRouter), chainSelector, address(mainRouter));
        minter = new Minter(chainSelector, address(sourceRouter), chainSelector, address(mainRouter));
        dsc = minter.getDsc();

        weth = new ERC20Mock();
        weth.mint(user, 1000 * 1 ether);

        wbtc = new ERC20Mock();
        wbtc.mint(user, 1000 * 1 ether);

        depositor.setAllowedToken(address(weth), true);
        depositor.setAllowedToken(address(wbtc), true);
        depositor.setAllowedDestinationChain(chainSelector, true);
        depositor.setAllowedSourceChain(chainSelector, true);
        depositor.setAllowedSender(address(mainRouter), true);

        minter.setAllowedDestinationChain(chainSelector, true);
        minter.setAllowedSourceChain(chainSelector, true);
        minter.setAllowedSender(address(mainRouter), true);

        mainRouter.setAllowedSourceChain(chainSelector, true);
        mainRouter.setAllowedDestinationChain(chainSelector, true);
        mainRouter.setAllowedSender(address(depositor), true);
        mainRouter.setAllowedSender(address(minter), true);
        mainRouter.setAvalancheDepositor(address(depositor));
        mainRouter.setAvalancheMinter(address(minter));

        wethMockAggregator = new MockV3Aggregator(8, 3000e8);
        wbtcMockAggregator = new MockV3Aggregator(8, 70000e8);

        mainRouter.addAllowedToken(chainSelector, address(weth), address(wethMockAggregator), 18);
        mainRouter.addAllowedToken(chainSelector, address(wbtc), address(wbtcMockAggregator), 18);
    }

    modifier Deposit (ERC20Mock _token, uint256 _amount) {
        vm.startPrank(user);
        _token.approve(address(depositor), _amount);
        depositor.deposit(address(_token), _amount);
        vm.stopPrank();

        assert(depositor.getDeposited(user, address(_token)) == _amount);
        assert(mainRouter.getDeposited(user, chainSelector, address(_token)) == _amount);
        _;
    }

    modifier DepositAndMint (ERC20Mock _token, uint256 _amountDeposit, uint256 _amountMint) {
        assert(mainRouter.calculateHealthFactor(_amountDeposit, _amountMint) > 1);

        vm.startPrank(user);
        _token.approve(address(depositor), _amountDeposit);
        depositor.deposit(address(_token), _amountDeposit);
        vm.stopPrank();

        assert(depositor.getDeposited(user, address(_token)) == _amountDeposit);
        assert(mainRouter.getDeposited(user, chainSelector, address(_token)) == _amountDeposit);

        vm.startPrank(user);
        mainRouter.mint(chainSelector, address(minter), _amountMint);
        vm.stopPrank();

        assert(_amountMint == dsc.balanceOf(user));
        assert(_amountMint == minter.getMinted(user));
        assert(_amountMint == mainRouter.getMinted(user, chainSelector));

        _;  
    }

    function test_deposit() external {
        vm.startPrank(user);
        weth.approve(address(depositor), 1000 * 1 ether);
        depositor.deposit(address(weth), 1000 * 1 ether);
        vm.stopPrank();

        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == 1000 * 1 ether);
    }

    function test_redeem() external Deposit(weth, 1000 ether) {
        console.log("Balance of Depositor Contract before: ", weth.balanceOf(address(depositor)));
        console.log("Balance of user before: ", weth.balanceOf(user));

        uint256 amountRedeem = 500 ether;

        vm.startPrank(user);
        mainRouter.redeem(chainSelector, address(depositor), address(weth), amountRedeem);
        vm.stopPrank();

        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == amountRedeem);
        assert(depositor.getDeposited(user, address(weth)) == amountRedeem);

        console.log("Balance of Depositor Contract after: ", weth.balanceOf(address(depositor)));
        console.log("Balance of user after: ", weth.balanceOf(user));
    }

    function test_mint() external Deposit(weth, 1 ether) {
        uint256 _amountMint = 1000 ether;
        console.log("Balance of user minted before minting: ", dsc.balanceOf(user));

        vm.startPrank(user);
        mainRouter.mint(chainSelector, address(minter), _amountMint);
        vm.stopPrank();

        console.log("User total collateral in USD: ", mainRouter.getUserOverallCollateralValue(user));
        console.log("Balance of user minted after minting: ", dsc.balanceOf(user));
        console.log("User health factor: ", mainRouter.getUserHealthFactor(user));
        console.log("User to LTV: ", mainRouter.getUserFractionToLTV(user));

        assert(_amountMint == dsc.balanceOf(user));
        assert(_amountMint == minter.getMinted(user));
        assert(_amountMint == mainRouter.getMinted(user, chainSelector));
    }

    function test_burn() external DepositAndMint(weth, 1 ether, 1000 ether){
        uint256 _amountMint = 1000 ether;
        uint256 _amountBurn = 500 ether;
        vm.startPrank(user);
        dsc.approve(address(minter), _amountBurn);
        minter.burn(_amountBurn);
        vm.stopPrank();

        console.log("Balance of user minted after burning: ", dsc.balanceOf(user));

        assert(_amountMint - _amountBurn == dsc.balanceOf(user));
        assert(_amountMint - _amountBurn == minter.getMinted(user));
        assert(_amountMint - _amountBurn == mainRouter.getMinted(user, chainSelector));
    }


    function testCantRedeemMoreThanDeposited() external Deposit(weth, 1000 ether){
        uint256 _amountDeposit = 1000 ether;
        uint256 _amountRedeem = 1500 ether;

        console.log("Balance of Depositor Contract before: ", weth.balanceOf(address(depositor)));
        console.log("Balance of user before: ", weth.balanceOf(user));

        vm.startPrank(user);
        vm.expectRevert();
        mainRouter.redeem(chainSelector, address(depositor), address(weth), _amountRedeem);
        vm.stopPrank();
    }

    function testAddMoreThanOneCollateral() external Deposit(weth, 1 ether) Deposit(wbtc, 1 ether){
        console.log("Balance of user collateral in USD: ", mainRouter.getUserOverallCollateralValue(user));

        assert(mainRouter.getUserCollateralValue(user, chainSelector, address(weth)) == 3000 ether);
        assert(mainRouter.getUserCollateralValue(user, chainSelector, address(wbtc)) == 70000 ether);
        assert(mainRouter.getUserCollateralOnChainValue(user, chainSelector) == 73000 ether);
        assert(mainRouter.getUserOverallCollateralValue(user) == 73000 ether);
    }

    function testCanReddemWhenHealthFactorIsMoreThanOne() external DepositAndMint (weth, 1 ether, 1000 ether) {
        uint256 amountRedeem = 0.5 ether;

        console.log("User health factor before redeeming: ", mainRouter.getUserHealthFactor(user));

        vm.startPrank(user);
        mainRouter.redeem(chainSelector, address(depositor), address(weth), amountRedeem);
        vm.stopPrank();
        console.log(mainRouter.getDeposited(user, chainSelector, address(weth)));
        console.log(weth.balanceOf(user));
        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == 0.5 ether);
        assert(depositor.getDeposited(user, address(weth)) == 0.5 ether);
        assert(weth.balanceOf(user) == 1000 ether - 1 ether + 0.5 ether);

        console.log("User health factor after redeeming: ", mainRouter.getUserHealthFactor(user));
    }

    function testCantRedeemWhenHealthFactorIsLessThanOne() external DepositAndMint(weth, 1 ether, 1000 ether){
        uint256 amountRedeem = 0.2 ether;
        wethMockAggregator.updateAnswer(1500e8);

        console.log("User health factor before redeeming: ", mainRouter.getUserHealthFactor(user));
        console.log("User health factor if redeeming: ", mainRouter.calculateHealthFactor(0.8 ether, 1000 ether));

        vm.startPrank(user);
        vm.expectRevert(MainRouter.HealthFactorTooLow.selector);
        mainRouter.redeem(chainSelector, address(depositor), address(weth), amountRedeem);
        vm.stopPrank();
    }

    function testDepositAndMint() external {
        vm.startPrank(user);
        weth.approve(address(depositor), 1 ether);
        depositor.depositAndMint(address(weth), 1 ether, chainSelector, address(minter), 1000 ether);
        vm.stopPrank();

        console.log(mainRouter.getUserOverallCollateralValue(user));
        console.log(mainRouter.getUserMintedOverall(user));

    }

    function testBurnAndMint() external DepositAndMint(weth, 1 ether, 1000 ether) {
        vm.startPrank(user);
        dsc.approve(address(minter), 500 ether);
        minter.burnAndMint(500 ether, chainSelector, address(minter));
        vm.stopPrank();

        console.log(mainRouter.getUserOverallCollateralValue(user));
        console.log(mainRouter.getUserMintedOverall(user));
    }

    function testGetLTV() external DepositAndMint(weth, 1 ether, 1000 ether){
        console.log("User to LTV: ", mainRouter.getMaximumAllowedMinting(user));
    }

    function testLiquidate() external DepositAndMint(weth, 1 ether, 1000 ether) {
        address liquidator = makeAddr("liquidator");
        weth.mint(liquidator, 1000 ether);
        uint256 _amountDeposit = 1 ether;
        uint256 _amountMint = 1000 ether;
        ERC20Mock _token = weth;

        assert(mainRouter.calculateHealthFactor(_amountDeposit, _amountMint) > 1);

        vm.startPrank(liquidator);
        _token.approve(address(depositor), _amountDeposit);
        depositor.deposit(address(_token), _amountDeposit);
        vm.stopPrank();

        assert(depositor.getDeposited(liquidator, address(_token)) == _amountDeposit);
        assert(mainRouter.getDeposited(liquidator, chainSelector, address(_token)) == _amountDeposit);

        vm.startPrank(liquidator);
        mainRouter.mint(chainSelector, address(minter), _amountMint);
        vm.stopPrank();

        assert(_amountMint == dsc.balanceOf(liquidator));
        assert(_amountMint == minter.getMinted(liquidator));
        assert(_amountMint == mainRouter.getMinted(liquidator, chainSelector));

        console.log(weth.balanceOf(liquidator));

        wethMockAggregator.updateAnswer(1200e8);
        vm.startPrank(liquidator);
        dsc.approve(address(minter), 1000 ether);
        minter.liquidate(user, address(weth), chainSelector, address(depositor), 900 ether, 1e6);
        vm.stopPrank();

        console.log(mainRouter.getDeposited(user, chainSelector, address(weth)));
        console.log(depositor.getDeposited(user, address(weth)));
        console.log("User health factor after liquidating: ", mainRouter.getUserHealthFactor(user));
        console.log(weth.balanceOf(liquidator));
    }
}