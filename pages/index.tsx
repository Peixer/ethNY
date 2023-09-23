import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import NFTGrid from "../components/NFT/NFTGrid";
import { useContract, useNFTs } from "@thirdweb-dev/react";
import { NFT_COLLECTION_ADDRESS } from "../const/contractAddresses";
import Container from "../components/Container/Container";
import { useState } from "react";
import type { NFT as NFTType } from "@thirdweb-dev/sdk";

/**
 * Landing page with a simple gradient background and a hero asset.
 * Free to customize as you see fit.
 */
const Home: NextPage = () => {
  const { contract } = useContract(NFT_COLLECTION_ADDRESS);
  const { data, isLoading } = useNFTs(contract);
  const [select, setSelect] = useState<NFTType[]>([]);

  function handleSelect(nft: NFTType) {
    if (select.includes(nft)) {
      setSelect(select.filter((item) => item !== nft));
    } else {
      setSelect([...select, nft]);
    }
  }
  function isSelected(nft: NFTType) {
    return select.includes(nft);
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <Container maxWidth="lg">
            <h1>SEEELLER</h1>
            <NFTGrid
              data={data}
              isLoading={isLoading}
              handleSelect={handleSelect}
              isSelected={isSelected}
              emptyText={
                "Looks like there are no NFTs in this collection. Did you import your contract on the thirdweb dashboard? https://thirdweb.com/dashboard"
              }
            />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Home;
