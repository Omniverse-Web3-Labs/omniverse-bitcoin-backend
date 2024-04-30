export interface S3Config {
    client: string;
    bucket: string;
}

export interface Config {
    provider: string;
    receipt: string;
    network: string;
    publicKey: string;
    gas: {
        txid: string;
        vout: number;
    };
    s3: S3Config;
}

const config: Config = {
    provider: "http://127.0.0.1:18443",
    receipt: "1234",
    network: "regtest",
    publicKey: "0x1234567812345678123456781234567812345678123456781234567812345678",
    gas: {
        txid: "0x12345678",
        vout: 0
    },
    s3: {
        client: "",
        bucket: ""
    }
}

export default config;