import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import NFTGrid from "../components/NFT/NFTGrid";
import { useAddress, useContract } from "@thirdweb-dev/react";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<any[]>([]);

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
                collection: index % 2 ? "cochela" : "ens",
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

  function createOffer() {
    console.log(select);
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <Container maxWidth="lg">
            <h1>Select </h1>

            <div>
              <a onClick={() => filter("cochela")}>Cochella</a>
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
            <h2>How much I want to sell this shit</h2>
            <input type="number"></input>
            <br></br>
            <button onClick={createOffer}>Offer</button>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Home;
