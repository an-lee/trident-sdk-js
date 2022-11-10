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

export interface Collectible {
  collection_id: string;
  identerfier: string;
  token_id: string;
  metahash: string;
  name: string;
  icon_url: string;
  media_url: string;
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
