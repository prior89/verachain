// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title VeraChainNFT
 * @dev Privacy-first NFT certificate for luxury product authentication
 * Implements burn-and-mint pattern for privacy-preserving transfers
 */
contract VeraChainNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Certificate data structure
    struct Certificate {
        string brand;
        string model;
        string certNumber;
        uint256 timestamp;
        bool burned;
    }
    
    // Mappings
    mapping(uint256 => Certificate) public certificates;
    mapping(string => bool) public usedCertNumbers;
    mapping(address => uint256[]) private _userTokens;
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string certNumber
    );
    
    event CertificateBurned(uint256 indexed tokenId);
    
    event CertificateTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );
    
    constructor() ERC721("VeraChain Certificate", "VERA") Ownable(msg.sender) {
        // Start token IDs from 1
        _tokenIdCounter.increment();
    }
    
    /**
     * @dev Mint a new NFT certificate
     * @param recipient Address to receive the NFT
     * @param brand Product brand
     * @param model Product model
     * @param certNumber Certificate number (must be unique)
     * @return tokenId The ID of the newly minted NFT
     */
    function mintCertificate(
        address recipient,
        string memory brand,
        string memory model,
        string memory certNumber
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(certNumber).length > 0, "Certificate number required");
        require(!usedCertNumbers[certNumber], "Certificate number already used");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(recipient, tokenId);
        
        // Store certificate data
        certificates[tokenId] = Certificate({
            brand: brand,
            model: model,
            certNumber: certNumber,
            timestamp: block.timestamp,
            burned: false
        });
        
        // Mark certificate number as used
        usedCertNumbers[certNumber] = true;
        
        // Track user tokens
        _userTokens[recipient].push(tokenId);
        
        // Set token URI (can be IPFS hash or metadata URL)
        string memory tokenURI = string(
            abi.encodePacked(
                "https://api.verachain.io/metadata/",
                toString(tokenId)
            )
        );
        _setTokenURI(tokenId, tokenURI);
        
        emit CertificateMinted(tokenId, recipient, certNumber);
        
        return tokenId;
    }
    
    /**
     * @dev Burn certificate for privacy-preserving transfer
     * @param tokenId Token to burn
     */
    function burnCertificate(uint256 tokenId) public {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!certificates[tokenId].burned, "Already burned");
        
        certificates[tokenId].burned = true;
        _burn(tokenId);
        
        // Remove from user tokens
        _removeTokenFromUser(msg.sender, tokenId);
        
        emit CertificateBurned(tokenId);
    }
    
    /**
     * @dev Transfer with privacy (burn old, mint new)
     * @param to Recipient address
     * @param tokenId Token to transfer
     * @return newTokenId The ID of the newly minted replacement NFT
     */
    function transferWithPrivacy(
        address to,
        uint256 tokenId
    ) public returns (uint256) {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner");
        require(to != address(0), "Invalid recipient");
        require(!certificates[tokenId].burned, "Already burned");
        
        // Get certificate data
        Certificate memory cert = certificates[tokenId];
        
        // Burn old NFT
        burnCertificate(tokenId);
        
        // Generate new certificate number for privacy
        string memory newCertNumber = string(
            abi.encodePacked(
                "VERA-",
                toString(block.timestamp),
                "-",
                toString(_tokenIdCounter.current())
            )
        );
        
        // Mint new NFT with same product data but new certificate number
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, newTokenId);
        
        certificates[newTokenId] = Certificate({
            brand: cert.brand,
            model: cert.model,
            certNumber: newCertNumber,
            timestamp: block.timestamp,
            burned: false
        });
        
        usedCertNumbers[newCertNumber] = true;
        _userTokens[to].push(newTokenId);
        
        // Set new token URI
        string memory tokenURI = string(
            abi.encodePacked(
                "https://api.verachain.io/metadata/",
                toString(newTokenId)
            )
        );
        _setTokenURI(newTokenId, tokenURI);
        
        emit CertificateTransferred(tokenId, msg.sender, to);
        emit CertificateMinted(newTokenId, to, newCertNumber);
        
        return newTokenId;
    }
    
    /**
     * @dev Get certificate data
     * @param tokenId Token ID to query
     * @return Certificate data
     */
    function getCertificate(uint256 tokenId) 
        public 
        view 
        returns (Certificate memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return certificates[tokenId];
    }
    
    /**
     * @dev Get user's NFT tokens (no history exposed)
     * @param user User address
     * @return Array of current token IDs
     */
    function getUserTokens(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        // Filter out burned tokens
        uint256[] memory userTokens = _userTokens[user];
        uint256 activeCount = 0;
        
        // Count active tokens
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (_ownerOf(userTokens[i]) == user) {
                activeCount++;
            }
        }
        
        // Create array of active tokens only
        uint256[] memory activeTokens = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (_ownerOf(userTokens[i]) == user) {
                activeTokens[index] = userTokens[i];
                index++;
            }
        }
        
        return activeTokens;
    }
    
    /**
     * @dev Check if certificate number is already used
     * @param certNumber Certificate number to check
     * @return bool True if used, false otherwise
     */
    function isCertNumberUsed(string memory certNumber) 
        public 
        view 
        returns (bool) 
    {
        return usedCertNumbers[certNumber];
    }
    
    /**
     * @dev Get total supply of tokens
     * @return Current total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
    
    // Internal functions
    
    /**
     * @dev Remove token from user's list
     * @param user User address
     * @param tokenId Token to remove
     */
    function _removeTokenFromUser(address user, uint256 tokenId) private {
        uint256[] storage userTokens = _userTokens[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Convert uint to string
     * @param value Uint value
     * @return String representation
     */
    function toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Override functions
    
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}