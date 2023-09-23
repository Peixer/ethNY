import { ConnectWallet, useAddress, useContract } from "@thirdweb-dev/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { SWAP_ADDRESS } from "../../const/contractAddresses";
import { useEffect, useState } from "react";

/**
 * Navigation bar that shows up on all pages.
 * Rendered in _app.tsx file above the page content.
 */
export function Navbar() {
  const address = useAddress();
  const [isPending, setIsPending] = useState<boolean>(false);
  const { contract } = useContract(SWAP_ADDRESS);

  useEffect(() => {
    async function hasPendingOffer() {
      if (address && contract) {
        const data = await contract.call("userHasPendingOffer", [address]);
        return data;
      }
      return false;
    }
    hasPendingOffer().then(setIsPending).catch(console.error);
  }, [address, contract]);

  return (
    <div className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={`${styles.homeLink} ${styles.navLeft}`}>
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="NFT marketplace sample logo"
            />
          </Link>
        </div>

        <div className={styles.navRight}>
          <div className={styles.navConnect}>
            <Link href={`/pending/${address}`} style={{ marginRight: 20 }}>
              <Image
                className={styles.profileImage}
                src="/user-icon.png"
                width={42}
                height={42}
                alt="Profile"
                style={{ border: isPending ? "2px solid red" : "none" }}
              />
            </Link>
            <ConnectWallet theme="dark" btnTitle="Connect Wallet" />
          </div>
        </div>
      </nav>
    </div>
  );
}
