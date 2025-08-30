import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useBlockchain = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    // Check if MetaMask is available or use local provider
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Listen for account changes
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
        } else {
          // User switched accounts - only update if account actually changed
          try {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            // Only update if the account actually changed
            if (address !== account) {
              setSigner(signer);
              setAccount(address);
              setConnected(true);
              console.log('Account switched to:', address);
            }
          } catch (error) {
            console.error('Error handling account change:', error);
          }
        }
      };

      // Listen for chain changes
      const handleChainChanged = (chainId) => {
        // Reset connection state instead of reloading page
        console.log('Chain changed to:', chainId);
        disconnect();
        // Note: User will need to reconnect manually after chain change
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    } else {
      // Fallback to local Anvil node
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');
      setProvider(provider);
      
      // For development, auto-connect with a test account
      connectWithTestAccount(provider);
    }
  }, [account]);

  const connectWithTestAccount = async (provider) => {
    try {
      // Use one of Anvil's test private keys
      const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const wallet = new ethers.Wallet(testPrivateKey, provider);
      
      setSigner(wallet);
      setAccount(wallet.address);
      setConnected(true);
      
      console.log('Connected with test account:', wallet.address);
    } catch (error) {
      console.error('Error connecting with test account:', error);
    }
  };

  const connect = async () => {
    if (!provider) return;

    try {
      if (window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setSigner(signer);
        setAccount(address);
        setConnected(true);
        
        console.log('Connected to account:', address);
      } else {
        // Already connected with test account
        console.log('Using test account connection');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const disconnect = () => {
    setSigner(null);
    setAccount(null);
    setConnected(false);
  };

  return {
    provider,
    signer,
    connected,
    account,
    connect,
    disconnect
  };
};