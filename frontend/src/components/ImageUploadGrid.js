import React from 'react';
import './ImageUploadGrid.css';

const ImageUploadGrid = ({ images, onImageUpload, disabled = false }) => {
  const handleFileSelect = (index, event) => {
    if (disabled) return;
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(index, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    if (disabled) return;
    onImageUpload(index, null);
  };

  return (
    <div className="image-upload-grid">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div key={index} className={`upload-cell ${disabled ? 'disabled' : ''}`}>
          <div className="upload-cell-inner">
            {images[index] ? (
              <div className="image-container">
                <img src={images[index]} alt={`Upload ${index + 1}`} />
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveImage(index)}
                  title="Remove image"
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            ) : (
              <label className={`upload-label ${disabled ? 'disabled' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(index, e)}
                  hidden
                  disabled={disabled}
                />
                <div className="upload-placeholder">
                  <span className="upload-icon">+</span>
                  <span className="upload-text">Upload</span>
                </div>
              </label>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageUploadGrid;