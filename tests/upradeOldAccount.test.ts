import { deployOldAccount_v0_2_2, v0_2_2_proxyClassHash, v_0_2_3_classHash } from "../services";

describe("ArgentAccount", function () {
  const salt = 5656n;

  it(`Deploy 0.2.2 account`, async function () {
    await deployOldAccount_v0_2_2(v0_2_2_proxyClassHash, v_0_2_3_classHash, "0.2.3", 200000000000000n, salt);
  });
});
