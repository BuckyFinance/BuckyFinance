pragma solidity ^0.8.19;

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
    MockV3Aggregator mockAggregator;
    

    address public constant functionsRouter = address(0);
    bytes32 public constant donId = bytes32(0);

    ERC20Mock public weth;
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

        mainRouter = new MainRouter(address(destinationRouter), functionsRouter, donId);
        depositor = new Depositor(address(sourceRouter), chainSelector, address(mainRouter));
        minter = new Minter(address(sourceRouter), chainSelector, address(mainRouter));
        dsc = minter.getDsc();
        weth = new ERC20Mock();
        weth.mint(user, 1000 * 1 ether);

        depositor.setAllowedToken(address(weth), true);
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

        mockAggregator = new MockV3Aggregator(8, 3000e8);

        mainRouter.addAllowedToken(chainSelector, address(weth), address(mockAggregator));
    }

    function test_deposit() external {
        vm.startPrank(user);
        weth.approve(address(depositor), 1000 * 1 ether);
        depositor.deposit(address(weth), 1000 * 1 ether);
        vm.stopPrank();

        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == 1000 * 1 ether);
    }

    function test_redeem() external {
        vm.startPrank(user);
        weth.approve(address(depositor), 1000 * 1 ether);
        depositor.deposit(address(weth), 1000 * 1 ether);
        vm.stopPrank();

        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == 1000 * 1 ether);

        console.log("Balance of Depositor Contract before: ", weth.balanceOf(address(depositor)));
        console.log("Balance of user before: ", weth.balanceOf(user));

        vm.startPrank(user);
        mainRouter.redeem(chainSelector, address(depositor), address(weth), 500 * 1 ether);
        vm.stopPrank();

        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == 500 * 1 ether);
        assert(depositor.getDeposited(user, address(weth)) == 500 * 1 ether);

        console.log("Balance of Depositor Contract after: ", weth.balanceOf(address(depositor)));
        console.log("Balance of user after: ", weth.balanceOf(user));
    }

    function test_mint() external {
        uint256 _amountMint = 1000 ether;
        console.log("Balance of minted before mint: ", dsc.balanceOf(user));

        vm.startPrank(user);
        mainRouter.mint(chainSelector, address(minter), _amountMint);
        vm.stopPrank();

        console.log("Balance of minted after mint: ", dsc.balanceOf(user));

        assert(_amountMint == dsc.balanceOf(user));
        assert(_amountMint == minter.getMinted(user));
        assert(_amountMint == mainRouter.getMinted(user, chainSelector));
    }

    function test_burn() external {
        uint256 _amountMint = 1000 ether;
        console.log("Balance of minted before mint: ", dsc.balanceOf(user));

        vm.startPrank(user);
        mainRouter.mint(chainSelector, address(minter), _amountMint);
        vm.stopPrank();

        console.log("Balance of minted after mint: ", dsc.balanceOf(user));

        assert(_amountMint == dsc.balanceOf(user));
        assert(_amountMint == minter.getMinted(user));
        assert(_amountMint == mainRouter.getMinted(user, chainSelector));

        uint256 _amountBurn = 500 ether;
        vm.startPrank(user);
        dsc.approve(address(minter), _amountBurn);
        minter.burn(_amountBurn);
        vm.stopPrank();

        console.log("Balance of minted: ", dsc.balanceOf(user));

        assert(_amountMint - _amountBurn == dsc.balanceOf(user));
        assert(_amountMint - _amountBurn == minter.getMinted(user));
        assert(_amountMint - _amountBurn == mainRouter.getMinted(user, chainSelector));
    }


    function testCantRedeemMoreThanDeposited() external {
        vm.startPrank(user);
        weth.approve(address(depositor), 1000 * 1 ether);
        depositor.deposit(address(weth), 1000 * 1 ether);
        vm.stopPrank();

        assert(mainRouter.getDeposited(user, chainSelector, address(weth)) == 1000 * 1 ether);

        console.log("Balance of Depositor Contract before: ", weth.balanceOf(address(depositor)));
        console.log("Balance of user before: ", weth.balanceOf(user));

        vm.startPrank(user);
        vm.expectRevert();
        mainRouter.redeem(chainSelector, address(depositor), address(weth), 1500 * 1 ether);
        vm.stopPrank();
    }


}