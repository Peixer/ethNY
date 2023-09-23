import type { NFT as NFTType } from "@thirdweb-dev/sdk";
import Link from "next/link";
import React, { useState } from "react";
import { NFT_COLLECTION_ADDRESS } from "../../const/contractAddresses";
import Skeleton from "../Skeleton/Skeleton";
import NFT from "./NFT";
import styles from "../../styles/Buy.module.css";

type Props = {
  isLoading: boolean;
  data: any[] | undefined;
  handleSelect: (nft: any) => void;
  isSelected: (nft: any) => boolean;
  emptyText?: string;
};

export default function NFTGrid({
  isLoading,
  data,
  handleSelect,
  isSelected,
  emptyText = "No NFTs found for this collection.",
}: Props) {
  return (
    <div className={styles.nftGridContainer}>
      {isLoading ? (
        [...Array(20)].map((_, index) => (
          <div key={index} className={styles.nftContainer}>
            <Skeleton key={index} width={"100%"} height="312px" />
          </div>
        ))
      ) : data && data.length > 0 ? (
        data.map((nft) => (
          <div
            key={nft.metadata.id}
            className={styles.nftContainer}
            style={{border: isSelected(nft) ? "2px solid green" : ""}}
            onClick={() => handleSelect(nft)}
          >
            <NFT nft={nft} />
          </div>
        ))
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}
