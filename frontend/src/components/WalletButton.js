import React from 'react';
import './WalletButton.css';

const WalletButton = ({ connected, account, onConnect, onDisconnect }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-button-wrapper">
      <div className="wallet-button-container">
        {connected ? (
          <button 
            className="wallet-button connected"
            onClick={onDisconnect}
            title={account}
          >
            {formatAddress(account)}
          </button>
        ) : (
          <button 
            className="wallet-button disconnected"
            onClick={onConnect}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletButton;