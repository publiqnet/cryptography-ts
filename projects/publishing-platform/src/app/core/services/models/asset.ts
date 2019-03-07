export interface AssetOptions {
  description?: string;
  dynamic_asset_data_id?;
  id?;
  issuer?;
  max_supply?;
  monitored_asset_opts?;
  precision?;
  symbol?;
}

export class Asset {
  description: string;
  dynamic_asset_data_id;
  id;
  issuer;
  max_supply;
  monitored_asset_opts;
  precision;
  symbol;

  constructor(options?: AssetOptions) {
    if (options.description) {
      this.description = options.description;
    }
    if (options.dynamic_asset_data_id) {
      this.dynamic_asset_data_id = options.dynamic_asset_data_id;
    }
    if (options.issuer) {
      this.issuer = options.issuer;
    }
    if (options.id) {
      this.id = options.id;
    }
    if (options.max_supply) {
      this.max_supply = options.max_supply;
    }
    if (options.monitored_asset_opts) {
      this.monitored_asset_opts = options.monitored_asset_opts;
    }
    if (options.precision) {
      this.precision = options.precision;
    }
    if (options.symbol) {
      this.symbol = options.symbol;
    }
  }
}
