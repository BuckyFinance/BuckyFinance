// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.0;

// import { Script } from "forge-std/Script.sol";
// import { Parameters } from "./Parameters.sol";
// import { Depositor } from "../src/Depositor.sol";
// import { Minter } from "../src/Minter.sol";
// import { MainRouter } from "../src/MainRouter.sol";
// import { DSC } from "../src/DSC.sol";


// contract Deployer is Script, Parameters {
//     function run() external returns (DSC dsc, MainRouter mainRouter, Minter minter, Depositor depositor) {
//         dsc = new DSC();
//         mainRouter = new MainRouter();
//         minter = new Minter();
//         depositor = new Depositor();
//     }
// }