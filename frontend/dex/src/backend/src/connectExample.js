import "./App.css";
import { ethers } from "ethers";
import { useState } from "react"

function App() {
    const [add, setAdd] = useState("")
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();

    async function connectMetamask() {
        const res = await provider.send("eth_requestAccounts", []);
        setAdd(res);
    }

    async function myAddress() {
        await signer.getAddress();
    }

    return (
        <div className="general">
            <div className="web3-loader">
                <button className="button1" onClick={connectMetamask}>
                    Connect Metamask
                </button>
            </div>
            <br></br>
            <div className="input-area">
                <label>{`your address is ${add}`} </label>
                <br></br>
                <label>Recipient address:</label>
                <input
                    type="text"
                    placeholder="Receiver address"
                    className="input2"
                ></input>
                <br></br>
                <label>Amount:</label>
                <input
                    type="text"
                    placeholder="Amount of ETH"
                    className="input3"
                ></input>
            </div>
        </div>
    );
}

export default App;