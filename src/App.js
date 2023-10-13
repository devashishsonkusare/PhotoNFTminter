import './App.css';
import Home from './Component/Home/Home';
import { createRoot } from "react-dom/client";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import { useState } from 'react';
import Navbar from './Component/Navbar/Navbar';

import DisplayNft from './Component/DisplayNft/DisplayNft';
const root = createRoot(document.getElementById("root"));

function App() {
  
  const [address, setAddress] = useState(""); // Initialize address state
  const [provider, setProvider] = useState("");
  // Function to update the address in state
  const updateAddress = (newAddress) => {
    setAddress(newAddress);
    console.log("ADDRESS Nav",address)
  };
  const updateProvider = (newProvider) => {
    setProvider(newProvider)
  }
  
  return (
    <BrowserRouter basename="/">
      <Navbar updateAddress={updateAddress} updateProvider={updateProvider} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<DisplayNft address={address} />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
