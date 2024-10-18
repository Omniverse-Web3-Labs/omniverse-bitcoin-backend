export interface S3Config {
    client: {
        region: string;
        forcePathStyle: boolean;
        credentials: {
            accessKeyId: string;
            secretAccessKey: string;
        }
    };
    bucket: string;
    path: string;
}

export interface Config {
    provider: string;
    network: string;
    rpcuser: string;
    rpcpassword: string;
    publicKey: string;
    gas: {
        txid: string;
        vout: number;
    };
    s3: S3Config;
}