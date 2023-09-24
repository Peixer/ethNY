import type { NextPage } from "next";
import styles from "../../styles/Home.module.css";
import NFTGrid from "../../components/NFT/NFTGrid";
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import Container from "../../components/Container/Container";
import { useEffect, useState } from "react";
import {
  SWAP_ADDRESS,
} from "../../const/contractAddresses";
import axios from "axios";

const Pending: NextPage = () => {
  const address = useAddress();
  const [data, setData] = useState<any[]>([]);
  const { contract } = useContract(SWAP_ADDRESS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { mutateAsync } = useContractWrite(contract, "replyOffer");

  useEffect(() => {
    async function hasPendingOffer() {
      if (address && contract) {
        const result = await contract.call("userHasPendingOffer", [address]);

        const promises = await Promise.all(
          result.map((x: any) => axios.get(x.tokenURI))
        );
        const datas = promises.map((x) => x.data);
        const formattedData = result.map((x: any, index: number) => ({
          ...x,
          metadata: {
            id: x.tokenId,
            image: datas[index].image,
            ...datas[index],
          },
        }));
        setData(formattedData);
        setIsLoading(false);
      }
      return false;
    }
    hasPendingOffer().catch(console.error);
  }, [address, contract]);

  async function replyOffer(accepted: boolean) {
    const response = await mutateAsync({
      args: {
        accepted,
      } as any,
    });

    // TODO: Show a confirmation modal
    // reset every component in the screen
    console.log("response", response);
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <Container maxWidth="lg">
            <h1>Review the offer</h1>

            <NFTGrid
              data={data}
              isLoading={isLoading}
              emptyText={
                "Looks like there are no NFTs in this collection. Did you import your contract on the thirdweb dashboard? https://thirdweb.com/dashboard"
              }
            />
            <h2>Price USDC</h2>
            <h2>{}</h2>
            <br></br>
            <div style={{ marginTop: 40 }}>
<button 
  onClick={() => replyOffer(true)} 
  style={{ 
    fontSize: '18px', 
    padding: '10px 20px', 
    borderRadius: '8px',
    backgroundColor: '#4CAF50', // Example color for Accept
    color: 'white',
    cursor: 'pointer',
    border: 'none'
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'} // Darker shade on hover
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
>
  Accept
</button>
<span style={{ marginRight: '40px' }}></span>
<button 
  onClick={() => replyOffer(false)} 
  style={{ 
    fontSize: '18px', 
    padding: '10px 20px', 
    borderRadius: '8px',
    backgroundColor: '#f44336', // Example color for Refuse
    color: 'white',
    cursor: 'pointer',
    border: 'none'
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#da190b'} // Darker shade on hover
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
>
  Refuse
</button>

            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Pending;
