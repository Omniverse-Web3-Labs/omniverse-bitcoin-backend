# Bitcoin backend for omniverse-dlt

This project works as an execution layer for omniverse protocol on Bitcoin.

## Prerequisites

- node >= v18
- npm
- OS: Ubuntu 20.04

## Usage

### Install

```
npm install
```

### Configuration

Open `config/config.ts`

- provider: The provider url from which go get on-chain data

### Token for gas fee

#### Regtest

You can use `omniverse-system-test` to generate account, which will be funded automatically

#### Testnet

You should generate the account yourself with the following commands

```
ord -t --rpc-url=<URL> wallet create
ord -t --rpc-url=<URL> wallet receive
```

Then get test tokens from [faucet](https://bitcoinfaucet.uo1.net/), and check blocks on [Bitcoin testnet explorer](https://blockstream.info/testnet/)

#### Mainnet

You should generate the account as [Testnet](#testnet) shows.

### Run

```
npx node-ts index.ts
```