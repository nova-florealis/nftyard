import React, { useState } from 'react';
import WalletButton from './components/WalletButton';
import ImageUploadGrid from './components/ImageUploadGrid';
import OutputDisplay from './components/OutputDisplay';
import { useBlockchain } from './hooks/useBlockchain';
import { generateRandomColorImage } from './utils/imageGenerator';
import './App.css';

function App() {
  const { 
    connected, 
    account, 
    connect, 
    disconnect, 
    userNFTs, 
    mintInitialNFTs, 
    combineNFTs 
  } = useBlockchain();
  const [uploadedImages, setUploadedImages] = useState(Array(6).fill(null));
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [outputImage, setOutputImage] = useState(null);

  const handleImageUpload = (index, imageData) => {
    const newImages = [...uploadedImages];
    newImages[index] = imageData;
    setUploadedImages(newImages);
    
    // Find corresponding NFT token ID for this index
    const nftForIndex = userNFTs.find(nft => nft.tokenId === index + 1);
    if (nftForIndex && imageData) {
      // Add to selected NFTs if not already selected
      if (!selectedNFTs.includes(nftForIndex.tokenId)) {
        setSelectedNFTs(prev => [...prev, nftForIndex.tokenId]);
      }
    } else if (nftForIndex && !imageData) {
      // Remove from selected NFTs if image was removed
      setSelectedNFTs(prev => prev.filter(id => id !== nftForIndex.tokenId));
    }
  };

  const handleCombine = async () => {
    if (!connected) {
      console.log('Please connect your wallet first');
      return;
    }

    if (selectedNFTs.length < 2) {
      console.log('Please upload at least 2 images to combine');
      return;
    }

    try {
      console.log('Combining NFTs:', selectedNFTs);
      await combineNFTs(selectedNFTs);
      
      // Generate combined image for display
      const randomImage = generateRandomColorImage();
      setOutputImage(randomImage);
      
      // Clear selected NFTs and uploaded images
      setSelectedNFTs([]);
      setUploadedImages(Array(6).fill(null));
      
      console.log(`Successfully combined ${selectedNFTs.length} NFTs into a new NFTYard NFT!`);
    } catch (error) {
      console.error('Error combining NFTs:', error);
      console.log('Failed to combine NFTs. Please try again.');
    }
  };

  const handleMintInitial = async () => {
    if (!connected) {
      console.log('Please connect your wallet first');
      return;
    }

    try {
      await mintInitialNFTs();
      console.log('Successfully minted 6 UserInputNFTs!');
    } catch (error) {
      console.error('Error minting NFTs:', error);
      console.log('Failed to mint NFTs. Please try again.');
    }
  };

  return (
    <div className="App">
      <WalletButton 
        connected={connected}
        account={account}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <main className="main-content">
        <div className="left-panel">
          {connected && userNFTs.length === 0 && (
            <div className="mint-section">
              <button 
                className="mint-button"
                onClick={handleMintInitial}
              >
                Mint 6 UserInput NFTs
              </button>
              <p>First, mint your 6 UserInput NFTs to get started</p>
            </div>
          )}
          
          <ImageUploadGrid 
            images={uploadedImages}
            onImageUpload={handleImageUpload}
          />
          
          {connected && userNFTs.length > 0 && (
            <div className="nft-status">
              <p>You own {userNFTs.length} UserInput NFTs</p>
              <p>Selected for combining: {selectedNFTs.length}</p>
            </div>
          )}
          
          <div className="combine-button-container">
            <button 
              className="combine-button"
              onClick={handleCombine}
              disabled={!connected || selectedNFTs.length < 2}
            >
              Combine ({selectedNFTs.length} NFTs)
            </button>
          </div>
        </div>
        
        <div className="right-panel">
          <OutputDisplay outputImage={outputImage} />
        </div>
      </main>
    </div>
  );
}

export default App;