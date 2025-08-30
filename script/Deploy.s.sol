// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/NFTYard.sol";
import "../contracts/UserInputNFT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Use deterministic salt for consistent addresses
        bytes32 salt = bytes32("nftyard_v1");
        
        UserInputNFT userInputNFT = new UserInputNFT{salt: salt}();
        NFTYard nftYard = new NFTYard{salt: salt}();

        console.log("UserInputNFT deployed to:", address(userInputNFT));
        console.log("NFTYard deployed to:", address(nftYard));

        vm.stopBroadcast();
    }
}