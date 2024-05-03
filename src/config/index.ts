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
    receipt: string;
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

const config: Config = {
    provider: "http://127.0.0.1:18443",
    receipt: "1234",
    network: "regtest",
    rpcuser: "rpcuser",
    rpcpassword: "rpcpassword",
    publicKey: "02ea227677f4118a4a679271b333fc589ef7a1520e02af1c36768013dc3e06397f",
    gas: {
        txid: "c440051da7f62a05a593835a65960f41dd56b134fcb24bf3baf39475511fea58",
        vout: 0
    },
    s3: {
        client: {
			region: "us-east-1",
			forcePathStyle: true,
			credentials: {
				accessKeyId: "accessKeyId",
				secretAccessKey: "secretAccessKey"
			}
		},
		bucket: "bucket",
		path: "path"
    }
}

export default config;