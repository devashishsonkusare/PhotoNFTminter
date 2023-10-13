import React,{useState,useEffect} from 'react'
import "./DisplayNft.css"

import { AnimatePresence, motion, useAnimation } from 'framer-motion/dist/framer-motion';

const DisplayNft = ({address}) => {
    console.log("ADDRESS display", address)
    
    const [nftData, setNftData] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [loadingImages, setLoadingImages] = useState(true);
    const [selectedChainId, setSelectedChainId] = useState('80001');
    const [name, setName] = useState({})
    const [description, setDescription] = useState({})
    const [filteredNftData, setFilteredNftData] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const controls = useAnimation(); 

    const chains = [
        { id: '02', name: 'Binance Smart Chain Testnet', chainId: '97' },
        { id: '03', name: 'Goerli Testnet', chainId: '5' },
        { id: '04', name: 'Polygon Mumbai Testnet', chainId: '80001' },
        { id: '05', name: 'Sepolia Testnet', chainId: '11155111' },
        { id: '06', name: 'Optimism Goerli Testnet', chainId: '420' },
        { id: '07', name: 'Arbitrum Goerli Testnet', chainId: '421613' },
        { id: '08', name: 'Avalanche Fuji Testnet', chainId: '43113' },
        { id: '09', name: 'Hedera TestNet', chainId: '296' },
    ];

    async function getFileFromIPFS(uri) {
        let cid = uri.replace(/ipfs:\/\//, '').replace(/ipfs:\//, '').replace(/ipfs\/\//, '').replace(/ipfs\//, '').replace(/\/$/, '');

        uri = 'ipfs/' + cid;
        const ipfsGatewayUrl =
            'https://ipfs-gateway.node.krypcore.io/api/v0/ipfs?apiKey=ac2d904a-cad4-425b-a2d7-3a4a8d2b64c6&token=34bc1382-33aa-4306-a331-db5029e8dcee';
        const parts = ipfsGatewayUrl.split('?');
        const finalIpfsUrl = `${parts[0]}/${uri}?${parts[1]}`;
        const response = await fetch(finalIpfsUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');

        if (contentType.includes('json')) {
            return await response.json();
        } else if (contentType.includes('image')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } else if (contentType.includes('text')) {
            return await response.text();
        } else if (contentType.includes('pdf') || contentType.includes('octet-stream')) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } else {
            throw new Error(`Unsupported content type: ${contentType}`);
        }
    }
    useEffect(() => {
        // Trigger animations when loadingImages becomes false

        if (!loadingImages) {
            controls.start({ opacity: 1 });
        }
    }, [loadingImages, controls]);
    useEffect(() => {
        setFilteredNftData([])
        setLoadingImages(true); // Set loading to true when changing the chain

        if (!address) {
            setLoadingImages(false);
            return;
        }

        let fetchURL = selectedChainId
            ? `${baseUrl}getNFTsByChainIDsAndAdresses?chainId=${selectedChainId}&userAddress=${address}`
            : `${baseUrl}getAllchainNFTbyAddress?userAddress=${address}`;

        fetch(fetchURL)
            .then((response) => response.json())
            .then(async (data) => {
                if (data.myData) {

                    const filteredData = selectedChainId
                        ? data.myData.filter((nft) => nft.chainId === Number(selectedChainId) && nft.mintedIn === "photoNFT")
                        : data.myData;

                    setFilteredNftData(filteredData); // Update filteredNftData with the filtered data
                    setLoadingImages(true); // Set loading back to true before fetching images

                    const urls = {};
                    const loading = {};
                    const name = {};
                    const description = {};

                    for (let nft of filteredData) {
                        loading[nft.tokenId] = true;
                        const fileData = await getFileFromIPFS(nft.tokenUri);
                        const imageUrl = await getFileFromIPFS(fileData.image);
                        urls[nft.tokenId] = imageUrl;
                        loading[nft.tokenId] = false;
                        name[nft.tokenId] = fileData.name;
                        description[nft.tokenId] = fileData.description;
                    }

                    setImageUrls(urls);
                    setName(name);
                    setDescription(description);
                    setLoadingImages(false);
                    controls.start({ opacity: 1 });
                }
            })
            .catch((error) => {
                setLoadingImages(false); // Stop loading spinner on error
                // TODO: Provide user feedback about the error
            });
    }, [address, selectedChainId, controls]);
    useEffect(() => {
        controls.start({ opacity: 0 });
    }, [nftData, controls]);

  return (
    <div>
          <div className="address">
              <div
                  className="glassmorphic-container-display"
                  style={{ padding: "0.5rem" }}
              >
                  <div
                      style={{
                          fontWeight: "400",
                          width: "fit-content",
                          whiteSpace: "nowrap",
                          marginLeft: "0.5rem"
                      }}
                  >
                      Address:
                  </div>
                  {address ? (
                      <input
                          type="text"
                          className="glassmorphic-input-display"
                          value={address}
                          style={{ height: "auto" }}
                          readOnly
                      />
                  ) : (
                      <input
                          type="button"
                          className="glassmorphic-input-display"
                          value="Connect Wallet"
                          style={{ height: "auto" }}
                      />
                  )}
              </div>
          </div>
          <div className='cards'>
              {!address ? (
                  <p style={{ margin: 'auto', color: 'white', zIndex: '1' }}>Connect your wallet</p>
              ) : (
                  <AnimatePresence>
                      {loadingImages ? (
                          <div className='loader-container'>
                          </div>
                      ) : filteredNftData.length === 0 ? ( // Check if nftData is empty
                          <p style={{ margin: 'auto', color: 'white', zIndex: '1' }}>You don't have any NFTs.</p>
                      ) : (!loadingImages &&
                          filteredNftData.slice().reverse().map((nft, index) => (
                              <motion.div
                                  className='card'
                                  key={index}
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={controls} // Use animation controls here
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeInOut' }} // Apply easing function
                              >
                                  <img
                                      src={imageUrls[nft.tokenId] || ''}
                                      alt='NFT'
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.5, ease: 'easeInOut' }} // Apply easing function
                                      loading="lazy"
                                  />

                                  <motion.p
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      <motion.strong
                                          initial={{ opacity: 0, y: -20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }} // Apply easing function
                                      >
                                          Chain:
                                      </motion.strong>{' '}
                                      {
                                          // Find the chain name corresponding to the chain ID
                                          chains.find(chain => chain.chainId === nft.chainId.toString())?.name || 'Unknown Chain'
                                      }                  </motion.p>
                                  <motion.strong
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.5, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      Token ID:
                                  </motion.strong>
                                  <motion.p
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.6, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      {nft.tokenId}
                                  </motion.p>
                                  <motion.strong
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.5, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      Name:
                                  </motion.strong>
                                  <motion.p
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.6, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      {name[nft.tokenId]}
                                  </motion.p>
                                  <motion.strong
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.5, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      Description:
                                  </motion.strong>
                                  <motion.p
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.6, ease: 'easeInOut' }} // Apply easing function
                                  >
                                      {description[nft.tokenId]}
                                  </motion.p>

                              </motion.div>

                          ))
                      )}
                  </AnimatePresence>
              )}
          </div>
    </div>
  )
}

export default DisplayNft