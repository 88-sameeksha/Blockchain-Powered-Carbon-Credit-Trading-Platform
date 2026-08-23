import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi/CarbonCreditTrading.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export default function App() {
  const [account, setAccount] = useState("");
  const [credit, setCredit] = useState(null);
  const [creditId, setCreditId] = useState("1");
  const [message, setMessage] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage("Install a browser wallet such as MetaMask for the local demo.");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setAccount(await signer.getAddress());
    setMessage("Wallet connected.");
  }

  async function readCredit() {
    if (!CONTRACT_ADDRESS) {
      setMessage("Set VITE_CONTRACT_ADDRESS in frontend/.env.local first.");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    const c = await contract.getCreditDetails(creditId);
    setCredit(c);
    setMessage("Credit loaded from the blockchain.");
  }

  async function retireCredit() {
    if (!CONTRACT_ADDRESS || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    const tx = await contract.retireCredit(creditId, "Educational retirement simulation");
    await tx.wait();
    setMessage(`Retirement transaction confirmed: ${tx.hash}`);
    await readCredit();
  }

  return (
    <main className="container">
      <h1>Blockchain Carbon Credit Marketplace</h1>
      <p className="notice">
        Educational prototype using simulated credits and test wallets only.
      </p>

      <button onClick={connectWallet}>Connect Wallet</button>
      <p>{account ? `Connected: ${account}` : "Wallet not connected"}</p>

      <section className="card">
        <h2>Credit Lookup</h2>
        <input value={creditId} onChange={(e) => setCreditId(e.target.value)} />
        <button onClick={readCredit}>Load Credit</button>
        {credit && (
          <div>
            <p><b>Project:</b> {credit.projectName}</p>
            <p><b>Tonnes:</b> {credit.tonnesCO2e.toString()}</p>
            <p><b>Owner:</b> {credit.owner}</p>
            <p><b>Status:</b> {["ISSUED","ACTIVE","LISTED","TRANSFERRED","RETIRED"][Number(credit.status)]}</p>
            <button onClick={retireCredit}>Retire Credit</button>
          </div>
        )}
      </section>

      <p>{message}</p>
    </main>
  );
}
