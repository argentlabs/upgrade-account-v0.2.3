import { upgradeOldContract } from "../services";
await upgradeOldContract(process.env.ADDRESS!, process.env.PRIVATE_KEY!);
