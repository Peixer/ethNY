import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import NFTGrid from "../components/NFT/NFTGrid";
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import Container from "../components/Container/Container";
import { useEffect, useState } from "react";
import {
  NFT_COLLECTION_ADDRESSES,
  SWAP_ADDRESS,
} from "../const/contractAddresses";
import axios from "axios";

/**
 * Landing page with a simple gradient background and a hero asset.
 * Free to customize as you see fit.
 */
const Home: NextPage = () => {
  const address = useAddress();
  const [select, setSelect] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const { contract } = useContract(SWAP_ADDRESS);
  const { mutateAsync, isLoading: isLoadingWrite } = useContractWrite(
    contract,
    "createOffer"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [addressFieldText, setAddressFieldText] = useState<string>("");
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      if (address && contract) {
        const data = await Promise.all(
          NFT_COLLECTION_ADDRESSES.map(async (collectionAddress) => {
            const result = await getOwnedNFTs(collectionAddress);
            const promises = await Promise.all(
              result.map((x) => axios.get(x.tokenURI))
            );
            const datas = promises.map((x) => x.data);
            return result.map((x, index) => ({
              ...x,
              metadata: {
                id: x.tokenId,
                image: datas[index].image,
                collection: index % 2 ? "coachella" : "ens",
                ...datas[index],
              },
            }));
          })
        );
        setData(data.flat());
        setFilteredData(data.flat());
        setIsLoading(false);
      }
    }
    fetchData().catch(console.error);
  }, [address, contract]);

  function getOwnedNFTs(collectionAddress: string): Promise<any[]> {
    // const result = await contract.call("ownedNFTs", [
    //   collectionAddress,
    //   address,
    // ]);
    //Mock for now
    return Promise.resolve([
      {
        tokenId: 1,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
      {
        tokenId: 2,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
      {
        tokenId: 3,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
      {
        tokenId: 4,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
      {
        tokenId: 5,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
      {
        tokenId: 6,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
      {
        tokenId: 6,
        tokenURI: "https://api.npoint.io/ac1e20d0428bd0604f07",
      },
    ]);
  }

  function handleSelect(nft: any) {
    if (select.includes(nft)) {
      setSelect(select.filter((item) => item !== nft));
    } else {
      setSelect([...select, nft]);
    }
  }

  function isSelected(nft: any) {
    return select.includes(nft);
  }

  function filter(collectionName: string) {
    const filtered = data.filter(
      (x) => x.metadata.collection === collectionName
    );
    setFilteredData(filtered);
  }

  function filterByAddress(address: string) {
    const filtered = data.filter((x) => x.owner === address);
    setFilteredData(filtered);
  }

  async function createOffer() {
    if (select.length > 0) {
      const response = await mutateAsync({
        args: {
          tokenIds: select.map((x) => ({
            tokenId: x.tokenId,
          })),
          price,
        } as any,
      });
      // Show a confirmation modal 
      // reset every component in the screen
      setAddressFieldText("");
      setPrice(0);
      setSelect([]);
      setFilteredData(data);
      console.log("response", response);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <Container maxWidth="lg">
            <h1>Select the NFTs you want to exchange</h1>

            <br />

            <input
              type="text"
              placeholder="Search by username, address, or ENS"
              onChange={(e) => setAddressFieldText(e.target.value)}
              value={addressFieldText}
              style={{ width: "400px" }}
            />
            
            <div style={{ marginTop: 40 }}>
              <a onClick={() => filter("coachella")}>Coachella</a>
              <span> | </span>
              <a onClick={() => filter("ens")}>ENS</a>
            </div>

            <NFTGrid
              data={filteredData}
              isLoading={isLoading}
              handleSelect={handleSelect}
              isSelected={isSelected}
              emptyText={
                "Looks like there are no NFTs in this collection. Did you import your contract on the thirdweb dashboard? https://thirdweb.com/dashboard"
              }
            />
            <h2>Price USDC</h2>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.valueAsNumber)}
            ></input>
            <br></br>
            <button onClick={createOffer} style={{ marginTop: 40 }}>
              Create Offer
            </button>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Home;
