// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTYard is ERC721, Ownable {
    uint256 private _tokenIds;
    
    mapping(uint256 => address) public graveyard;
    mapping(uint256 => uint256[]) public graveyardTokens;
    
    event NFTsCombined(
        address indexed user,
        uint256[] graveyardedTokens,
        uint256 newTokenId
    );
    
    constructor() ERC721("NFTYard", "YARD") Ownable(msg.sender) {}
    
    function combineNFTs(
        address userInputContract,
        uint256[] calldata tokenIds
    ) external returns (uint256) {
        require(tokenIds.length > 0, "Must provide token IDs");
        
        IERC721 userInputNFT = IERC721(userInputContract);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                userInputNFT.ownerOf(tokenIds[i]) == msg.sender,
                "Not owner of token"
            );
            
            userInputNFT.transferFrom(msg.sender, address(this), tokenIds[i]);
        }
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        graveyard[newTokenId] = userInputContract;
        graveyardTokens[newTokenId] = tokenIds;
        
        _mint(msg.sender, newTokenId);
        
        emit NFTsCombined(msg.sender, tokenIds, newTokenId);
        
        return newTokenId;
    }
    
    function getGraveyardTokens(uint256 tokenId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return graveyardTokens[tokenId];
    }
    
    function getGraveyardContract(uint256 tokenId) 
        external 
        view 
        returns (address) 
    {
        return graveyard[tokenId];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
}