// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UserInputNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    uint256 public constant MAX_SUPPLY = 6;
    bool public deployed = false;
    
    event InitialMint(address indexed recipient, uint256[] tokenIds);
    
    constructor() ERC721("UserInputNFT", "UIN") Ownable(msg.sender) {}
    
    function mintInitialSix(address recipient) external {
        require(!deployed, "Initial mint already completed");
        require(recipient != address(0), "Invalid recipient");
        
        uint256[] memory tokenIds = new uint256[](MAX_SUPPLY);
        
        for (uint256 i = 0; i < MAX_SUPPLY; i++) {
            _tokenIds++;
            uint256 tokenId = _tokenIds;
            _mint(recipient, tokenId);
            tokenIds[i] = tokenId;
        }
        
        deployed = true;
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