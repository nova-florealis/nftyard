import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { UserInputNFT_ABI, NFTYard_ABI } from '../contracts/abis';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

export const useBlockchain = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [userInputNFTContract, setUserInputNFTContract] = useState(null);
  const [nftYardContract, setNFTYardContract] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [nftYardBalance, setNFTYardBalance] = useState(0);

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

  const initializeContracts = async (signerOrProvider) => {
    try {
      console.log('CONTRACT_ADDRESSES object:', CONTRACT_ADDRESSES);
      console.log('UserInputNFT address:', CONTRACT_ADDRESSES.UserInputNFT);
      console.log('NFTYard address:', CONTRACT_ADDRESSES.NFTYard);
      
      if (!CONTRACT_ADDRESSES.UserInputNFT || !CONTRACT_ADDRESSES.NFTYard) {
        console.warn('Contract addresses not configured');
        return;
      }

      const userInputContract = new ethers.Contract(
        CONTRACT_ADDRESSES.UserInputNFT,
        UserInputNFT_ABI,
        signerOrProvider
      );

      const nftYardContract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFTYard,
        NFTYard_ABI,
        signerOrProvider
      );

      setUserInputNFTContract(userInputContract);
      setNFTYardContract(nftYardContract);

      console.log('Contracts initialized:', {
        UserInputNFT: CONTRACT_ADDRESSES.UserInputNFT,
        NFTYard: CONTRACT_ADDRESSES.NFTYard
      });
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  };

  const loadUserNFTs = async (userAddress, contract) => {
    try {
      if (!contract || !userAddress) {
        console.log('loadUserNFTs: Missing contract or userAddress', { contract: !!contract, userAddress });
        return;
      }
      
      console.log('Loading NFTs for address:', userAddress);
      console.log('Contract address:', contract.target);
      
      // First check if contract is deployed by checking bytecode
      const provider = contract.runner.provider || contract.provider;
      const bytecode = await provider.getCode(contract.target);
      console.log('Contract bytecode length:', bytecode.length);
      
      if (bytecode === '0x') {
        console.error('Contract not deployed at address:', contract.target);
        return;
      }
      
      console.log('Checking balance...');
      const balance = await contract.balanceOf(userAddress);
      console.log('User balance:', balance.toString());
      
      const nfts = [];
      
      // Only check for tokens if user has some
      if (balance > 0) {
        // Get total supply to know how many tokens exist
        const totalSupply = await contract.totalSupply();
        console.log('Total supply:', totalSupply.toString());
        
        for (let i = 1; i <= totalSupply; i++) {
          try {
            const owner = await contract.ownerOf(i);
            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              nfts.push({
                tokenId: i,
                owner: owner,
                selected: false
              });
            }
          } catch (error) {
            // Token doesn't exist or not owned by user
            console.log(`Token ${i} doesn't exist or not owned by user`);
          }
        }
      } else {
        console.log('User has no NFTs yet');
      }
      
      setUserNFTs(nfts);
      console.log(`User owns ${nfts.length} UserInputNFTs:`, nfts);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
    }
  };

  const connectWithTestAccount = async (provider) => {
    try {
      // Use one of Anvil's test private keys
      const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      const wallet = new ethers.Wallet(testPrivateKey, provider);
      
      setSigner(wallet);
      setAccount(wallet.address);
      setConnected(true);
      
      await initializeContracts(wallet);
      
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
        
        await initializeContracts(signer);
        
        console.log('Connected to account:', address);
      } else {
        // Already connected with test account
        console.log('Using test account connection');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const mintInitialNFTs = async (amount = 6) => {
    try {
      if (!userInputNFTContract || !account) {
        console.error('Contract or account not available');
        return;
      }

      console.log(`Minting ${amount} UserInputNFTs to:`, account);
      const tx = await userInputNFTContract.mintInitial(account, amount);
      await tx.wait();
      
      console.log('Initial NFTs minted successfully');
      await loadUserNFTs(account, userInputNFTContract);
      await loadNFTYardBalance(account, nftYardContract);
    } catch (error) {
      console.error('Error minting initial NFTs:', error);
    }
  };

  const combineNFTs = async (selectedTokenIds) => {
    try {
      if (!nftYardContract || !userInputNFTContract || !account) {
        console.error('Contracts or account not available');
        return;
      }

      if (selectedTokenIds.length === 0) {
        console.error('No tokens selected for combination');
        return;
      }

      console.log('Approving NFTYard to transfer UserInputNFTs...');
      const approveTx = await userInputNFTContract.setApprovalForAll(nftYardContract.target, true);
      await approveTx.wait();

      console.log('Combining NFTs:', selectedTokenIds);
      const combineTx = await nftYardContract.combineNFTs(
        userInputNFTContract.target,
        selectedTokenIds
      );
      const receipt = await combineTx.wait();
      
      console.log('NFTs combined successfully');
      await loadUserNFTs(account, userInputNFTContract);
      await loadNFTYardBalance(account, nftYardContract);
      
      return receipt;
    } catch (error) {
      console.error('Error combining NFTs:', error);
      throw error;
    }
  };

  const loadNFTYardBalance = async (userAddress, contract) => {
    try {
      if (!contract || !userAddress) {
        console.log('loadNFTYardBalance: Missing contract or userAddress');
        setNFTYardBalance(0);
        return;
      }
      
      const balance = await contract.balanceOf(userAddress);
      setNFTYardBalance(Number(balance.toString()));
      console.log('NFTYard balance:', balance.toString());
    } catch (error) {
      console.error('Error loading NFTYard balance:', error);
      setNFTYardBalance(0);
    }
  };

  const disconnect = () => {
    setSigner(null);
    setAccount(null);
    setConnected(false);
    setUserInputNFTContract(null);
    setNFTYardContract(null);
    setUserNFTs([]);
    setNFTYardBalance(0);
  };

  // Load user NFTs when contracts and account are ready
  useEffect(() => {
    if (userInputNFTContract && account) {
      loadUserNFTs(account, userInputNFTContract);
    }
    if (nftYardContract && account) {
      loadNFTYardBalance(account, nftYardContract);
    }
  }, [userInputNFTContract, nftYardContract, account]);

  return {
    provider,
    signer,
    connected,
    account,
    connect,
    disconnect,
    userInputNFTContract,
    nftYardContract,
    userNFTs,
    nftYardBalance,
    mintInitialNFTs,
    combineNFTs,
    loadUserNFTs
  };
};