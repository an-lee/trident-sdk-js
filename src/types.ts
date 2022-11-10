export interface Keystore {
  client_id: string;
  private_key: string;
  session_id: string;
  pin: string;
  pin_token: string;
  client_secret?: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Currency {
  asset_id: string;
  name: string;
  symbol: string;
  price_usd: string;
  icon_url: string;
}

export interface Collection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  external_url: string;
  split: string;
  icon: {
    url: string;
  };
  creator: User;
}

export interface Collectible {
  collection_id: string;
  identerfier: string;
  token_id: string;
  metahash: string;
  name: string;
  icon_url: string;
  media_url: string;
}

export interface Metadata {
  creator: {
    id: string;
    name: string;
  };
  collection: {
    algorithm: string;
    name: string;
    symbol: string;
    description: string;
    icon: {
      url: string;
    };
  };
  token: {
    identerfier: string;
    name: string;
    description: string;
    icon: {
      url: string;
    };
    media: {
      url: string;
      hash: string;
    };
  };
  checksum: {
    fields: string[];
    algorithm: string;
  };
}

export interface Order {
  id: string;
  type: string;
  state: string;
  price: string;
  royalty: string;
  split: string;
  token_id: string;
  opened_at?: string;
  expired_at?: string;
  completed_at?: string;
  item: Collectible;
  currency: Currency;
  maker?: User;
  taker?: User;
  owner?: User;
}
