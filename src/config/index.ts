import fs from 'fs';

export interface S3ConfigData {
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

export interface ConfigData {
    provider: string;
    network: string;
    rpcuser: string;
    rpcpassword: string;
    publicKey: string;
    gas: {
        txid: string;
        vout: number;
    };
    s3: S3ConfigData;
}

export interface IConfig {
    getConfig(): ConfigData;
    getS3Config(): S3ConfigData;
}

export class Config implements IConfig {
    config: ConfigData;

    constructor() {
        const config = JSON.parse(fs.readFileSync("./config/default.json").toString());
        this.config = config as ConfigData;
    }
    getConfig(): ConfigData {
        return this.config;
    }

    getS3Config(): S3ConfigData {
        return this.config.s3;
    }
}