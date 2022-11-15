import {
  CollectibleOutputsResponse,
  MixinApi,
  SnapshotResponse,
} from "@mixin.dev/mixin-node-sdk";
import { AxiosInstance, AxiosResponse } from "axios";
import { Collectible, Collection, Keystore, Metadata, Order } from "./types";
export declare class Client {
  keystore?: Keystore;
  api: AxiosInstance;
  mixinApi?: ReturnType<typeof MixinApi>;
  constructor(keystore?: Keystore);
  info(): Promise<{
    members: string[];
    threshold: number;
  }>;
  collections(): Promise<AxiosResponse<any, any>>;
  collection(id: string): Promise<Collection>;
  createCollection(params: {
    name: string;
    symbol: string;
    description: string;
    split: string;
    external_url: string;
    icon_url?: string;
    icon_base64?: string;
  }): Promise<Collection>;
  updateCollection(
    id: string,
    params: {
      description?: string;
      split?: string;
      external_url?: string;
      icon_url?: string;
      icon_base64?: string;
    }
  ): Promise<Collection>;
  collectible(metahash: string): Promise<Collectible>;
  uploadMetadata(params: {
    metadata: Metadata;
    metahash: string;
  }): Promise<Metadata>;
  deposit(collection_id: string, identifier: number): Promise<any>;
  withdraw(
    collection_id: string,
    identifier: number,
    params?: {
      trace_id?: string;
    }
  ): Promise<SnapshotResponse>;
  airdrop(
    collection_id: string,
    identifier: number,
    params?: {
      receiver_id?: string;
      started_at?: number;
    }
  ): Promise<any>;
  orders(params?: {
    collection_id?: string;
    state?: "open" | "completed";
    type?: "ask" | "bid" | "auction";
    metahash?: string;
    maker_id?: string;
    page?: number;
  }): Promise<{
    orders: Order[];
    current_page: number;
    next_page: number & null;
    previous_page: number & null;
  }>;
  order(id: string): Promise<Order>;
  askOrder(
    collection_id: string,
    identifier: number,
    params: {
      price: string;
      asset_id: string;
      expired_at?: number;
      trace_id?: string;
    }
  ): Promise<SnapshotResponse>;
  auctionOrder(
    collection_id: string,
    identifier: number,
    params: {
      price: string;
      asset_id: string;
      reserve_price?: string;
      expired_at?: number;
      trace_id?: string;
    }
  ): Promise<SnapshotResponse>;
  bidOrder(
    collection_id: string,
    identifier: number,
    params: {
      price: string;
      asset_id: string;
      expired_at?: number;
      trace_id?: string;
    }
  ): Promise<SnapshotResponse>;
  fillOrder(
    collection_id: string,
    identifier: number,
    params: {
      order_id: string;
      trace_id?: string;
    }
  ): Promise<SnapshotResponse>;
  cancelOrder(
    collection_id: string,
    identifier: number,
    params: {
      order_id: string;
      trace_id?: string;
    }
  ): Promise<SnapshotResponse>;
  createAction(params: {
    type: "A" | "AU" | "B" | "F" | "C" | "W" | "AD";
    token_id?: string;
    order_id?: string;
    price?: string;
    asset_id?: string;
    reserve_price?: string;
    expired_at?: number;
    started_at?: number;
    receiver_id?: string;
  }): Promise<{
    memo: string;
    mtg: {
      members: string[];
      threshold: number;
    };
  }>;
  accessToken(): string;
  findCollectible(
    token_id: string,
    state: "unspent" | "signed" | "spent",
    offset?: string
  ): Promise<CollectibleOutputsResponse | null>;
}
