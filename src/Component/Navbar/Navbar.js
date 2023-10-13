import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const Navbar = ({ updateAddress, updateProvider }) => {
  const [activeItem, setActiveItem] = useState("home");
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  async function connectWallet() {
    if (window.ethereum) {
      try {
        // Connect to MetaMask
        const krypcoreWeb3SDK = require("@krypc/krypcore-web3-sdk").default;
        const Web3Engine = await krypcoreWeb3SDK.initialize({
          authorization: "21584306-c214-48f3-95b3-bf57846717dc",
          dappId: "DEV_DEMO_DSON_22_20230919",
        });
        const [provider, signer, address] =
          await Web3Engine.Utils.connectWallet();

        if (address) {
          setWalletConnected(true);
          setCurrentAddress(address); // Update the current address state
          updateAddress(address);
          updateProvider(provider);
          console.log("ADDRESS Namv", address);
        } else {
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
    }
  }
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setCurrentAddress(accounts[0]);

        if (accounts.length === 0) {
          // MetaMask is disconnected
          setWalletConnected(false);
          setCurrentAddress("");
        } else if (accounts[0] !== currentAddress) {
          // Account has changed in MetaMask
          setCurrentAddress(accounts[0]);
          updateAddress(accounts[0]);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [currentAddress, updateAddress]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <img
            src="https://krypcore.com/static/media/logo.ee8e995963f803c29a62da7258f9af25.svg"
            alt=""
            style={{ height: "5rem", width: "9rem", marginRight: "0.5rem" }}
          />
          <h2 className="logoheading"></h2>
          <button
            className="navbar-dark navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
            style={{ justifyContent: "right" }}
          >
            <ul className="navbar-nav ml-auto ">
              <li
                className={`nav-item ${
                  activeItem === "displaynft" ? "active" : ""
                }`}
              >
                <Link
                  to={"/"}
                  style={{
                    textDecoration: "none",
                    color: "white",
                    borderStyle: "solid",
                    borderColor: "white",
                    borderRadius: "10px",
                    marginRight: "2rem",
                  }}
                  className="nav-link"
                  href="#"
                >
                  Home
                </Link>
              </li>
              <li
                className={`nav-item ${
                  activeItem === "gallery" ? "active" : ""
                }`}
              >
                <Link
                  to={"gallery"}
                  style={{
                    textDecoration: "none",
                    color: "white",
                    borderStyle: "solid",
                    borderColor: "white",
                    borderRadius: "10px",
                    marginRight: "2rem",
                  }}
                  className="nav-link"
                  href="#"
                >
                  My NFT
                </Link>
              </li>
            </ul>

            <button
              style={{
                cursor: "pointer",
                appearance: "button",
                textTransform: "none",
                margin: "0px",
                fontFamily:
                  "EuclidCircularA, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
                fontSize: "18px",
                lineHeight: "20px",
                borderRadius: "12px",
                boxSizing: "border-box",
                overflow: "visible",
                transitionDuration: "0.15s",
                transitionProperty:
                  "color, backgroundColor, borderColor, textDecorationColor, fill, stroke, opacity, boxShadow, transform, filter, backdropFilter, -webkit-backdrop-filter",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow:
                  "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 152, 253, 0.2) 0px 4px 6px -1px, rgba(0, 152, 253, 0.2) 0px 2px 4px -2px",
                color: "rgb(255, 255, 255)",
                fontWeight: "500",
                whiteSpace: "nowrap",
                gap: "22px",
                justifyContent: "end",
                alignItems: "center",
                gridAutoFlow: "column",
                display: "grid",
                fontFeatureSettings: "normal",
                fontVariationSettings: "normal",
                padding: "15px 36px",
                background:
                  "rgba(0, 0, 0, 0) linear-gradient(90deg, rgb(180, 71, 235), rgb(39, 151, 255)) repeat scroll 0% 0% / auto border-box border-box",
                WebkitMask:
                  "linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px) padding-box padding-box, linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px)",
              }}
              onClick={connectWallet}
            >
              {walletConnected ? "Connected" : "Connect Wallet"}{" "}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
