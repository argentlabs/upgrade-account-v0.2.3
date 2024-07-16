import { Account, CallData, Contract, num, selector } from "starknet";
import {
  getEthBalance,
  provider,
  loadContract,
  KeyPair,
  v0_2_2_proxyClassHash,
  latestAccountClassHash_V_0_2_3_1_classHash,
  v_0_2_3_classHash,
} from ".";

export async function upgradeOldContract(accountAddress: string, privateKey: string): Promise<string> {
  console.log("upgrading old account:", accountAddress);
  const keyPair = new KeyPair(privateKey);
  const accountToUpgrade = new Account(provider, accountAddress, privateKey);
  const proxyContract = await loadContract(accountAddress);
  const proxyClassHash = await accountToUpgrade.getClassHashAt(accountAddress);
  console.log("proxyClassHash", proxyClassHash);
  if (proxyClassHash !== v0_2_2_proxyClassHash) {
    throw new Error("Unrecognized proxy");
  }

  let implementationClassHash = num.toHexString((await proxyContract.get_implementation()).implementation);
  console.log("implementationClassHash", implementationClassHash);

  if (implementationClassHash === latestAccountClassHash_V_0_2_3_1_classHash) {
    throw new Error("Account is in 0.2.3.1, use argent X to upgrade to newer versions");
  } else if (implementationClassHash === v_0_2_3_classHash) {
    console.log("upgrading from v0.2.3");
  } else {
    throw new Error("Unknown implementation class hash");
  }

  const currentSigner = num.toHexString(await provider.getStorageAt(accountAddress, selector.starknetKeccak("_signer")));
  if (num.toBigInt(currentSigner) !== keyPair.publicKey) {
    throw new Error("Signer doesn't match private key");
  }
  const currentGuardian = num.toHexString(await provider.getStorageAt(accountAddress, selector.starknetKeccak("_guardian")));
  if (currentGuardian !== "0x0") {
    throw new Error("Account has a guardian, can't upgrade");
  }

  const ethBalance = await getEthBalance(accountToUpgrade.address);
  if (ethBalance == 0n) {
    throw new Error("Account has no funds, please transfer some ETH to it");
  }
  const MAX_ALLOWED_FEE = 3000000000000000n; // 0.003 ETH
  const maxFee = ethBalance < MAX_ALLOWED_FEE ? ethBalance : MAX_ALLOWED_FEE;
  console.log("maxFee", maxFee, "WEI");

  const nonce = await provider.getNonceForAddress(accountAddress);
  console.log("nonce", nonce);

  const call = {
    contractAddress: accountAddress,
    entrypoint: "upgrade",
    calldata: CallData.compile({ implementation: latestAccountClassHash_V_0_2_3_1_classHash, calldata: [] }),
  };

  const submitResult = await accountToUpgrade.execute([call], undefined, { maxFee });
  console.log("upgrade transaction_hash", submitResult.transaction_hash);
  await provider.waitForTransaction(submitResult.transaction_hash);
  return submitResult.transaction_hash;
}
