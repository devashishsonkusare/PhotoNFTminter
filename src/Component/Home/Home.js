import React, { useState, useRef, useEffect } from "react";
import { Camera, CameraType } from "react-camera-pro";
import "./Home.css";
import axios from "axios";
import styled from "styled-components";
import { MdClose } from "react-icons/md";
import Modal from "react-modal";
import { ClipLoader, BarLoader } from "react-spinners";

import { Link } from "react-router-dom";
const ethers = require("ethers");

const ModalWrapper = styled.div`
  width: 400px;
  max-width: 100%; // Ensure the modal doesn't exceed the screen width
  height: auto;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  position: relative;
  z-index: 10;
  border-radius: 10px;
  padding: 20px; // Added padding to ensure content doesn't touch the edges

  @media (max-width: 500px) {
    width: 90%; // Reduce the width of the modal on small screens
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
`;

const ModalContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: 400px;
`;

const CloseModalButton = styled(MdClose)`
  cursor: pointer;
  position: absolute;
  top: 10px; // Adjusted the position
  right: 10px; // Adjusted the position
  width: 32px;
  height: 32px;
  padding: 0;
  z-index: 10;
`;
const Home = () => {
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false); // New state variable
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(undefined);
  const [userAddress, setUserAddress] = useState('');
  const [transactionHashes, setTransactionHashes] = useState();
  const [tokenIds, setTokenIds] = useState();
  const [show, setShow] = useState(true);
const [resolveEns, setResolveEns] = useState();
  const mintedIn ="photoNFT" ;
  async function MintNft(selectedChain, chainData) {
    const formData = new FormData();
    const byteCharacters = atob(image.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const imageBlob = new Blob([new Uint8Array(byteNumbers)], {
      type: "image/jpeg",
    });
    formData.append("file", imageBlob);

    const apiKey = process.env.REACT_APP_APIKEY;
    const token = process.env.REACT_APP_TOKEN;
    const apiUrl = process.env.REACT_APP_APIURL;

    try {
      const response = await axios.post(
        `${apiUrl}?apiKey=${apiKey}&token=${token}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        const metadata = {
          name: "demo",
          description: "demo",
          image: "ipfs://" + data.Hash,
        };
        const jsonString = JSON.stringify(metadata, null, 4);
        const blob = new Blob([jsonString], { type: "application/json" });
        const NFTformData = new FormData();
        NFTformData.append("file", blob, "nft-metadata.json");
        const responseMetadata = await axios.post(
          `${apiUrl}?apiKey=${apiKey}&token=${token}`,
          NFTformData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const datas = await responseMetadata.data;
        console.log("datas", datas);
        mintingNFT(
          selectedChain,
          userAddress,
          "ipfs://" + datas.Hash,
          selectedChain
        );
      } else {
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const mintingNFT = async (chainId, userAddress, tokenUri, chainName) => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const data = {
      chainId: chainId,
      userAddress: userAddress,
      tokenUri: tokenUri,
      mintedIn: mintedIn

    };

    axios
      .post(baseUrl + "nftMinter", data)
      .then((response) => {
        const txnhash = response.data.nftData.txHash;
        const tokenId = response.data.nftData.tokenId;
        console.log(txnhash);
        console.log(tokenId);
        setTransactionHashes(txnhash);
        console.log(transactionHashes);
        setTokenIds(tokenId);
        console.log(tokenIds);
      })
      .catch((error) => {
        console.error("Error with POST request:", error);
      });
  };
  async function resolveENSName(ensName) {
    const provider = ethers.getDefaultProvider(); // Connect to the Ethereum network
    const address = await provider.resolveName(ensName);
    return address;
  }
  const handleUserAddress = async () => {
    const trimmedInput = userAddress.trim();
    if (trimmedInput.includes('.eth')) {
      const address = await resolveENSName(trimmedInput);
      if (address) {
        setResolveEns(address);
        setUserAddress(address);
      } else {
        setResolveEns('No Such Ens Found');
        setUserAddress('');
      }
    } else {
      setResolveEns('');
      setUserAddress(trimmedInput);
    }
  };
 
  useEffect(() => {
    handleUserAddress();
  }, [userAddress]);
  const handleOnClick = () => {
    setImage(camera.current.takePhoto());
  };
  const handleRetake = () => {
    setImage(null);
  };
  const handlePhotoNft = async () => {
    if (image) {
      // Convert the base64 image data to a Blob
      const byteCharacters = atob(image.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const imageBlob = new Blob([new Uint8Array(byteNumbers)], {
        type: "image/jpeg",
      });

      const imageSizeInBytes = imageBlob.size;

      console.log(`Image size: ${imageSizeInBytes} bytes`);
      const formData = new FormData();
      formData.append("file", imageBlob);

      try {
        const response = await fetch("http://20.198.98.4:8000/cartoonify", {
          mode: "no-cors",
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        if (response.ok) {
          console.log("Image sent and processed successfully");
          setShow(false);
        } else {
          console.error(
            "Error during image processing:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error while sending image:", error);
      }
    } else {
      console.warn("No image to send. Take a photo first.");
    }
  };

  const handleMinting = async () => {
    if (isMinting) {
      return;
    }
    setIsMinting(true); // Set the flag to indicate minting is in progress
    setShowModal(true);
    try {
      // Specify the chain you want to mint the NFT for (Polygon chain with chainId 80001)
      const selectedChain = 80001;

      const metadata = {
        name: "demo",
        description: "demo",
        file: image, // Assuming nftFile is the input image
      };

      await MintNft(selectedChain, metadata);
      console.log("Minted nft");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsMinting(false); // Reset the flag after minting is complete or in case of an error
    }
  };
  return (
    <div class="style-0">
      <section data-testid="@header" class="style-1">
        <div class="style-2">
          <h1 data-testid="@header/title" class="style-3">
            Click Your Photo
          </h1>
          <p class="style-4">Make Your Photo NFT.</p>
        </div>
      </section>
      <div class="style-5">
        <div class="style-24">
          <div class="style-25"></div>
          <div class="style-26">
            {!image ? (
              <Camera
                ref={camera}
                aspectRatio="cover"
                numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
                videoSourceDeviceId={activeDeviceId}
                errorMessages={{
                  noCameraAccessible:
                    "No camera device accessible. Please connect your camera or try a different browser.",
                  permissionDenied:
                    "Permission denied. Please refresh and give camera permission.",
                  switchCamera:
                    "It is not possible to switch camera to different one because there is only one video device accessible.",
                  canvas: "Canvas is not supported.",
                }}
                videoReadyCallback={() => {
                  console.log("Video feed ready.");
                }}
              />
            ) : (
              <img src={image} alt="Taken photo" className="image" />
            )}
          </div>
        </div>
        {show && (
          <div className="address">
            <h3 style={{ color: "white", marginTop: "1rem" }}>Address</h3>
            <input
              placeholder="Address/ENS"
              className="input"
                onChange={(e) => setUserAddress(e.target.value)}
            />
          </div>
        )}

        <div class="style-6">
          {!image ? (
            <div class="style-7">
              <button
                type="button"
                data-testid="test-button"
                class="style-8"
                onClick={handleOnClick}
              >
                Take A Snap
                <div class="style-9">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="style-10"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        opacity="0.5"
                        d="M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        d="M17.5562 9.27246C17.096 9.27246 16.7229 9.63877 16.7229 10.0906C16.7229 10.5425 17.096 10.9088 17.5562 10.9088H18.6673C19.1276 10.9088 19.5007 10.5425 19.5007 10.0906C19.5007 9.63877 19.1276 9.27246 18.6673 9.27246H17.5562Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.0007 9.27246C9.69946 9.27246 7.83398 11.104 7.83398 13.3634C7.83398 15.6227 9.69946 17.4543 12.0007 17.4543C14.3018 17.4543 16.1673 15.6227 16.1673 13.3634C16.1673 11.104 14.3018 9.27246 12.0007 9.27246ZM12.0007 10.9088C10.6199 10.9088 9.50065 12.0078 9.50065 13.3634C9.50065 14.719 10.6199 15.8179 12.0007 15.8179C13.3814 15.8179 14.5007 14.719 14.5007 13.3634C14.5007 12.0078 13.3814 10.9088 12.0007 10.9088Z"
                        fill="#ffffff"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
              </button>
            </div>
          ) : (
            <div class="style-7">
              <button
                type="button"
                data-testid="test-button"
                class="style-8"
                onClick={handleRetake}
              >
                Retake Snap
                <div class="style-9">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="style-10"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M10 11.0006C10 10.4483 10.4477 10.0006 11 10.0006H13C13.5523 10.0006 14 10.4483 14 11.0006V13.0006C14 13.5529 13.5523 14.0006 13 14.0006H11C10.4477 14.0006 10 13.5529 10 13.0006V11.0006Z"
                        stroke="#00b3ff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>{" "}
                      <path
                        d="M4.25 12.0014C4.25042 12.4156 4.58654 12.751 5.00075 12.7506C5.41497 12.7502 5.75042 12.4141 5.75 11.9999L4.25 12.0014ZM6.144 8.1116L6.77414 8.51834L6.77451 8.51777L6.144 8.1116ZM9.19 5.5336L8.89458 4.84424L8.89364 4.84464L9.19 5.5336ZM13.111 5.1336L13.2635 4.39927L13.2611 4.39878L13.111 5.1336ZM16.585 7.0506L16.0451 7.57114L16.0456 7.57175L16.585 7.0506ZM18.29 10.0006L17.5692 10.2078C17.6626 10.5326 17.9617 10.7549 18.2996 10.7505C18.6376 10.7462 18.9309 10.5164 19.0159 10.1892L18.29 10.0006ZM19.7259 7.45725C19.8301 7.05635 19.5895 6.6469 19.1886 6.54271C18.7878 6.43853 18.3783 6.67906 18.2741 7.07996L19.7259 7.45725ZM19.75 11.9999C19.7496 11.5856 19.4135 11.2502 18.9993 11.2506C18.585 11.251 18.2496 11.5871 18.25 12.0014L19.75 11.9999ZM17.856 15.8896L17.2259 15.4829L17.2255 15.4834L17.856 15.8896ZM14.81 18.4676L15.1054 19.157L15.1064 19.1566L14.81 18.4676ZM10.889 18.8676L10.7365 19.6019L10.7389 19.6024L10.889 18.8676ZM7.415 16.9506L7.95495 16.4301L7.95436 16.4295L7.415 16.9506ZM5.71 14.0006L6.43082 13.7934C6.33745 13.4686 6.03835 13.2463 5.70039 13.2507C5.36244 13.255 5.06913 13.4848 4.98412 13.812L5.71 14.0006ZM4.27412 16.544C4.16993 16.9449 4.41046 17.3543 4.81136 17.4585C5.21225 17.5627 5.6217 17.3221 5.72589 16.9212L4.27412 16.544ZM5.75 11.9999C5.74877 10.7649 6.10441 9.55591 6.77414 8.51834L5.51387 7.70487C4.68737 8.98532 4.24848 10.4773 4.25 12.0014L5.75 11.9999ZM6.77451 8.51777C7.43011 7.50005 8.37429 6.70094 9.48637 6.22256L8.89364 4.84464C7.50751 5.4409 6.33066 6.43693 5.5135 7.70544L6.77451 8.51777ZM9.48543 6.22297C10.5808 5.75356 11.7933 5.62986 12.9609 5.86842L13.2611 4.39878C11.7942 4.09906 10.2708 4.25448 8.89458 4.84424L9.48543 6.22297ZM12.9585 5.86793C14.1352 6.11232 15.2109 6.7059 16.0451 7.57114L17.1249 6.53006C16.0814 5.44761 14.7357 4.70502 13.2635 4.39927L12.9585 5.86793ZM16.0456 7.57175C16.7615 8.31258 17.2846 9.21772 17.5692 10.2078L19.0108 9.79342C18.6585 8.5675 18.0107 7.44675 17.1244 6.52945L16.0456 7.57175ZM19.0159 10.1892L19.7259 7.45725L18.2741 7.07996L17.5641 9.81196L19.0159 10.1892ZM18.25 12.0014C18.2512 13.2363 17.8956 14.4453 17.2259 15.4829L18.4861 16.2963C19.3126 15.0159 19.7515 13.5239 19.75 11.9999L18.25 12.0014ZM17.2255 15.4834C16.5699 16.5012 15.6257 17.3003 14.5136 17.7786L15.1064 19.1566C16.4925 18.5603 17.6693 17.5643 18.4865 16.2958L17.2255 15.4834ZM14.5146 17.7782C13.4193 18.2476 12.2067 18.3713 11.0391 18.1328L10.7389 19.6024C12.2058 19.9021 13.7293 19.7467 15.1054 19.157L14.5146 17.7782ZM11.0415 18.1333C9.86478 17.8889 8.78909 17.2953 7.95495 16.4301L6.87506 17.4711C7.91861 18.5536 9.26434 19.2962 10.7365 19.6019L11.0415 18.1333ZM7.95436 16.4295C7.23854 15.6886 6.7154 14.7835 6.43082 13.7934L4.98919 14.2078C5.34156 15.4337 5.98931 16.5545 6.87565 17.4718L7.95436 16.4295ZM4.98412 13.812L4.27412 16.544L5.72589 16.9212L6.43589 14.1892L4.98412 13.812Z"
                        fill="#00b3ff"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
              </button>
              <button
                type="button"
                data-testid="test-button"
                class="style-8"
                onClick={handlePhotoNft}
              >
                Make it NFT
                <div class="style-9">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="style-10"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M8 11C9.10457 11 10 10.1046 10 9C10 7.89543 9.10457 7 8 7C6.89543 7 6 7.89543 6 9C6 10.1046 6.89543 11 8 11Z"
                        stroke="#00aaff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>{" "}
                      <path
                        d="M6.56055 21C12.1305 8.89998 16.7605 6.77998 22.0005 14.63"
                        stroke="#00aaff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>{" "}
                      <path
                        d="M18 3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H18C20.2091 21 22 19.2091 22 17V7C22 4.79086 20.2091 3 18 3Z"
                        stroke="#00aaff"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
              </button>
              {show && (
                <button
                  type="button"
                  data-testid="test-button"
                  class="style-8"
                  onClick={handleMinting}
                >
                  Mint NFT
                  <div class="style-9">
                    <svg
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="style-10"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M8 11C9.10457 11 10 10.1046 10 9C10 7.89543 9.10457 7 8 7C6.89543 7 6 7.89543 6 9C6 10.1046 6.89543 11 8 11Z"
                          stroke="#00aaff"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M6.56055 21C12.1305 8.89998 16.7605 6.77998 22.0005 14.63"
                          stroke="#00aaff"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M18 3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H18C20.2091 21 22 19.2091 22 17V7C22 4.79086 20.2091 3 18 3Z"
                          stroke="#00aaff"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
          },
        }}
      >
        <ModalWrapper style={{ width: "auto" }}>
          <ModalHeader>
            <h4>NFT Minting Confirmation</h4>
            <CloseModalButton onClick={() => setShowModal(false)} />
          </ModalHeader>
          <ModalContent>
            <ul>
              <li>
                NFT successfully minted on Polygon Mumbai blockchain.
                {!transactionHashes ? (
                  <ClipLoader color="#123abc" loading={true} size={15} />
                ) : (
                  <>
                    <p>
                      Transaction Hash:
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${transactionHashes}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {transactionHashes}
                      </a>
                    </p>
                    {tokenIds && <p>Token ID: {tokenIds}</p>}
                  </>
                )}
              </li>
            </ul>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </div>
  );
};

export default Home;
