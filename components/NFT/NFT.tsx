import React from "react";
import styles from "./NFT.module.css";

type Props = {
  nft: any;
};

import Image from "next/image";

export default function NFTComponent({ nft }: Props) {
  return (
    <>
      <Image
        src={nft.metadata.image}
        className={styles.nftImage}
        width={200}
        height={200}
        alt="Picture of the author"
      />
      <p className={styles.nftTokenId}>Token ID #{nft.metadata.id}</p>
      <p className={styles.nftName}>{nft.metadata.name}</p>
    </>
  );
}
