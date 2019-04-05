
export interface IAsset {
    amount: number;
    asset_id: string;
}

export class Asset implements IAsset {
    amount: number;
    asset_id: string;

    constructor(asset?: IAsset) {
        if (asset) {
            this.update(asset);
        }
    }

    update(asset: IAsset) {
        Object.assign(this, asset);
    }
}
