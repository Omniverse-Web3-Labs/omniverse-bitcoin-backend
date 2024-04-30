export interface Input {
    txid: string;
    vout: number;
}

export interface Output {
    scriptPubKey: {
        hex: string;
    },
    n: number;
    value: number;
}

export interface BitcoinTx {
    txid: string;
    vin: Array<Input>;
    vout: Array<Output>;
}

export interface BitcoinBlock {
    height: string;
    tx: Array<BitcoinTx>;
}
