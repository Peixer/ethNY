import { ethers } from "ethers";
import 'dotenv/config';
import { TestToken, TestToken__factory } from "../typechain-types";

const NFT_CONTRACT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const escrow_contract = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

async function main() {
  const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) throw new Error("Invalid RPC URL");
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const private_key = process.env.PRIVATE_KEY;
    if (!private_key || private_key.length != 64) throw new Error ("Invalid private key");
    const deployer = new ethers.Wallet(private_key, provider);
    const balance = await provider.getBalance(deployer.address);
    console.log(`The address of the deployer is ${deployer.address}`);
    console.log(`the deployer balance is`);
    console.log(`${balance} BASE goerli`);

    const nftContractFactory = new TestToken__factory(deployer);
    const nftContract = nftContractFactory.attach(NFT_CONTRACT).connect(deployer) as TestToken;
    const currentOwner = await nftContract.ownerOf(0);
    console.log(`the current owner of NFT 0 is ${currentOwner}`);
    const transferTx = await nftContract["safeTransferFrom(address,address,uint256)"](deployer.address,escrow_contract,0);
    await transferTx.wait();
    const newOwner = await nftContract.ownerOf(0);
    console.log(`the new owner of NFT 0 is ${newOwner}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

