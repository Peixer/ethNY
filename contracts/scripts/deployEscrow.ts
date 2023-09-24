import { ethers } from "ethers";
import 'dotenv/config';
import { TicketSale__factory } from "../typechain-types";

const nft_address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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

    const escrowFactory = new TicketSale__factory(deployer);
    const escrowContract = await escrowFactory.deploy(nft_address);
    await escrowContract.waitForDeployment();
    const escrowContractAddress = await escrowContract.getAddress();
    console.log(`The escrow contract address is ${escrowContractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});