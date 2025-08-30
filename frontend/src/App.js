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
    nftYardBalance,
    mintInitialNFTs, 
    combineNFTs 
  } = useBlockchain();
  const [uploadedImages, setUploadedImages] = useState(Array(6).fill(null));
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [outputImage, setOutputImage] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleImageUpload = (index, imageData) => {
    const newImages = [...uploadedImages];
    newImages[index] = imageData;
    setUploadedImages(newImages);
    
    // Find corresponding NFT for this index (use available NFTs in order)
    const nftForIndex = userNFTs[index];
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

  const defaultMintAmount = 6;

  const handleMintInitial = async () => {
    if (!connected || isMinting) {
      console.log('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    try {
      await mintInitialNFTs(defaultMintAmount);
      console.log(`Successfully minted ${defaultMintAmount} UserInputNFTs!`);
    } catch (error) {
      console.error('Error minting NFTs:', error);
      console.log('Failed to mint NFTs. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="App">
      <WalletButton 
        connected={connected}
        account={account}
        onConnect={connect}
        onDisconnect={disconnect}
        mintButton={
          <div className="mint-controls-top">
            <button 
              className={`mint-button-top ${isMinting ? 'loading' : ''}`}
              onClick={handleMintInitial}
              disabled={isMinting}
            >
              {isMinting ? 'Minting...' : `Mint ${defaultMintAmount} NFTs (${userNFTs.length})`}
            </button>
            <button 
              className="nftyard-count-button"
              disabled={true}
            >
              NFTYard NFTs ({nftYardBalance})
            </button>
          </div>
        }
      />

      <main className="main-content">
        <div className="left-panel">
          <ImageUploadGrid 
            images={uploadedImages}
            onImageUpload={handleImageUpload}
          />
          
          
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