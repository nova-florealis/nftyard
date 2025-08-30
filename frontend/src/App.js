import React, { useState } from 'react';
import WalletButton from './components/WalletButton';
import ImageUploadGrid from './components/ImageUploadGrid';
import OutputDisplay from './components/OutputDisplay';
import { useBlockchain } from './hooks/useBlockchain';
import { generateRandomColorImage } from './utils/imageGenerator';
import './App.css';

function App() {
  const { connected, account, connect, disconnect } = useBlockchain();
  const [uploadedImages, setUploadedImages] = useState(Array(6).fill(null));
  const [outputImage, setOutputImage] = useState(null);

  const handleImageUpload = (index, imageData) => {
    const newImages = [...uploadedImages];
    newImages[index] = imageData;
    setUploadedImages(newImages);
  };

  const handleCombine = () => {
    const uploadedCount = uploadedImages.filter(img => img !== null).length;
    
    if (uploadedCount < 2) {
      alert('Please upload at least 2 images to combine');
      return;
    }

    // Generate random color image for now
    const randomImage = generateRandomColorImage();
    setOutputImage(randomImage);
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
          <ImageUploadGrid 
            images={uploadedImages}
            onImageUpload={handleImageUpload}
          />
          <button 
            className="combine-button"
            onClick={handleCombine}
          >
            Combine
          </button>
        </div>
        
        <div className="right-panel">
          <OutputDisplay outputImage={outputImage} />
        </div>
      </main>
    </div>
  );
}

export default App;