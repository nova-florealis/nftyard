import React from 'react';
import './OutputDisplay.css';

const OutputDisplay = ({ outputImage }) => {
  return (
    <div className="output-display">
      <div className="output-frame">
        {outputImage ? (
          <img src={outputImage} alt="Combined output" />
        ) : (
          <div className="output-placeholder">
            <span className="placeholder-text" dangerouslySetInnerHTML={{__html: 'NECROMANCY.PROTOCOL<br />AWAITING_INPUT...'}}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputDisplay;