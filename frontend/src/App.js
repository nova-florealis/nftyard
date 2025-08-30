import React from 'react';
import WalletButton from './components/WalletButton';
import { useBlockchain } from './hooks/useBlockchain';
import './App.css';

function App() {
  const { connected, account, connect, disconnect } = useBlockchain();

  return (
    <div className="App">
      <WalletButton 
        connected={connected}
        account={account}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <header className="App-header">
        <h1>NFTYard</h1>
        <p>Welcome to NFTYard</p>
      </header>
    </div>
  );
}

export default App;