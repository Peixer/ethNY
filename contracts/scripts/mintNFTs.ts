import { ContractFactory, ethers } from "ethers";
import 'dotenv/config';
import { TestToken, TestToken__factory } from "../typechain-types";

const NFT_CONTRACT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

async function main() {
    // create provider connection to BASE testnet
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) throw new Error("Invalid RPC URL");
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // create wallet, display balance
    const private_key = process.env.PRIVATE_KEY;
    if (!private_key || private_key.length != 64) throw new Error ("Invalid private key");
    const deployer = new ethers.Wallet(private_key, provider);
    const balance = await provider.getBalance(deployer.address);
    console.log(`The address of the deployer is ${deployer.address}`);
    console.log(`the deployer balance is`);
    console.log(`${balance} BASE goerli`);

    // create contract instance
    const nftContractFactory = new TestToken__factory(deployer);
    const nftContract = nftContractFactory.attach(NFT_CONTRACT).connect(deployer) as TestToken;
    const nftContractAddress = await nftContract.getAddress();
    console.log(`instance of nft contract address:`);
    console.log(`${nftContractAddress}`);

    // mint an NFT to myself
    const mintNftTx = await nftContract.connect(deployer).safeMint(deployer.address, 0);
    await mintNftTx.wait();
    const nftOwner = await nftContract.ownerOf(0);
    console.log(`The owner of NFT 0 is ${nftOwner}`);

    // transfer NFT to escrow contract

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});