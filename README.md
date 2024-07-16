## What?

This project helps to upgrade Argent account, v0.2.3, to a version that can be used in the extension.
NOTE: this only works on mainnet

## How?

Install bun https://bun.sh/docs/installation

Run

```bash
yarn install
```

Create a file name `.env` following the example in `.env.example`. Make sure you fill ADDRESS with the address of the account to upgrade, and PRIVATE_KEY with the private key controlling that account.

Otherwise you can run the user-input.sh script with the following command:

```bash
source scripts/user-input.sh
```

Then run

```bash
bun run upgrade
```

It will output a transaction hash. You can go to your block explorer to see if the transaction succeeds

Delete the .env file after the upgrade is done
