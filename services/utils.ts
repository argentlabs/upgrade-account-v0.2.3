import { Account, RpcProvider, Signer, encode, ec, CallData, Contract, uint256, num, RPC } from "starknet";
import dotenv from "dotenv";
dotenv.config({ override: true });

export const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io" });

export const ethAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export async function sendEth(contractAddress: string, amount: bigint) {
  console.log(`Sending eth to ${contractAddress}....`);
  const deployer = new Account(provider, process.env.ADDRESS!, process.env.PRIVATE_KEY!);
  const { transaction_hash } = await deployer.execute({
    contractAddress: ethAddress,
    entrypoint: "transfer",
    calldata: CallData.compile({ recipient: contractAddress, amount: uint256.bnToUint256(amount) }),
  });
  await provider.waitForTransaction(transaction_hash);
  console.log(`ETH transfer successful ${contractAddress}`);
}

export async function getEthBalance(contractAddress: string): Promise<bigint> {
  const ethContract = await getEthContract();
  return await ethContract.balanceOf(contractAddress);
}

let ethContract: Contract;

export async function getEthContract() {
  if (ethContract) {
    return ethContract;
  }
  const ethProxy = await loadContract(ethAddress);
  if (ethProxy.abi.some((entry) => entry.name == "implementation")) {
    const implementationAddress = num.toHex((await ethProxy.implementation()).address);
    const ethImplementation = await loadContract(implementationAddress);
    ethContract = new Contract(ethImplementation.abi, ethAddress, ethProxy.providerOrAccount);
  } else {
    ethContract = ethProxy;
  }
  return ethContract;
}

export async function loadContract(contractAddress: string): Promise<Contract> {
  const { abi } = await provider.getClassAt(contractAddress);
  if (!abi) {
    throw new Error("Error while getting ABI");
  }
  return new Contract(abi, contractAddress, provider);
}

export class KeyPair extends Signer {
  constructor(pk?: string | bigint) {
    super(pk ? `${pk}` : `0x${encode.buf2hex(ec.starkCurve.utils.randomPrivateKey())}`);
  }

  public get privateKey() {
    return BigInt(this.pk as string);
  }

  public get publicKey() {
    return BigInt(ec.starkCurve.getStarkKey(this.pk));
  }
}
