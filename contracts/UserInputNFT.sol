// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UserInputNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    
    event InitialMint(address indexed recipient, uint256[] tokenIds);
    
    constructor() ERC721("UserInputNFT", "UIN") Ownable(msg.sender) {}
    
    function mintInitial(address recipient, uint256 amount) external {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0 && amount <= 50, "Invalid amount");
        
        uint256[] memory tokenIds = new uint256[](amount);
        
        for (uint256 i = 0; i < amount; i++) {
            _tokenIds++;
            uint256 tokenId = _tokenIds;
            _mint(recipient, tokenId);
            tokenIds[i] = tokenId;
        }
        
        emit InitialMint(recipient, tokenIds);
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
    
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked("https://api.nftyard.com/userinput/", Strings.toString(tokenId)));
    }
}