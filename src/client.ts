import { MixinApi, signAccessToken } from "@mixin.dev/mixin-node-sdk";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Collectible, Collection, Keystore, Metadata, Order } from "./types";
import { v4 as uuidv4 } from "uuid";
import { ExchangeAssetId, ExchangeMinimumAmount } from "./constant";
import { uniqueTokenId } from "./utils";

export class Client {
  public keystore?: Keystore;
  public api: AxiosInstance;
  public mixinApi?: ReturnType<typeof MixinApi>;

  constructor(keystore?: Keystore) {
    this.keystore = keystore;
    this.api = axios.create({
      baseURL: "https://thetrident.one",
    });

    if (keystore) {
      this.mixinApi = MixinApi({
        keystore: {
          user_id: keystore.client_id,
          ...keystore,
        },
      });
    }
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  info(): Promise<{
    members: string[];
    threshold: number;
  }> {
    return this.api.get("api");
  }

  collections() {
    return this.api.get("api/collections", {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }

  collection(id: string): Promise<Collection> {
    return this.api.get(`api/collections/${id}`);
  }

  createCollection(params: {
    name: string;
    symbol: string;
    description: string;
    split: string;
    external_url: string;
    icon_url?: string;
    icon_base64?: string;
  }): Promise<Collection> {
    return this.api.post(`api/collections`, params, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }

  updateCollection(
    id: string,
    params: {
      description?: string;
      split?: string;
      external_url?: string;
      icon_url?: string;
      icon_base64?: string;
    }
  ): Promise<Collection> {
    return this.api.put(`api/collections/${id}`, params, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }

  collectible(metahash: string): Promise<Collectible> {
    return this.api.get(`api/collectibles/${metahash}`);
  }

  uploadMetadata(params: {
    metadata: Metadata;
    metahash: string;
  }): Promise<Metadata> {
    return this.api.post("api/collectibles", params, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }

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
  }> {
    return this.api.get("api/orders", { params });
  }

  order(id: string): Promise<Order> {
    return this.api.get(`api/orders/${id}`);
  }

  async askOrder(
    collection_id: string,
    identerfier: number,
    params: {
      price: string;
      asset_id: string;
      expired_at?: number;
      trace_id?: string;
    }
  ): Promise<Object> {
    if (!this.keystore || !this.mixinApi) {
      throw new Error("keystore required");
    }

    const token_id = uniqueTokenId(collection_id, identerfier);
    const action = await this.createAction({
      type: "A",
      token_id: token_id,
      order_id: params.trace_id,
      price: params.price,
      asset_id: params.asset_id,
      expired_at: params.expired_at,
    });

    const tx = {
      asset_id: ExchangeAssetId,
      amount: ExchangeMinimumAmount,
      memo: action.memo,
      trace_id: params.trace_id || uuidv4(),
      opponent_multisig: {
        receivers: action.mtg.members,
        threshold: action.mtg.threshold,
      },
    };
    return this.mixinApi.transfer.toAddress(this.keystore.pin, tx);
  }

  async auctionOrder(
    collection_id: string,
    identerfier: number,
    params: {
      price: string;
      asset_id: string;
      reserve_price?: string;
      expired_at?: number;
      trace_id?: string;
    }
  ): Promise<Object> {
    if (!this.keystore || !this.mixinApi) {
      throw new Error("keystore required");
    }

    const token_id = uniqueTokenId(collection_id, identerfier);
    const action = await this.createAction({
      type: "AU",
      token_id: token_id,
      order_id: params.trace_id,
      price: params.price,
      reserve_price: params.reserve_price,
      asset_id: params.asset_id,
      expired_at: params.expired_at,
    });

    const tx = {
      asset_id: ExchangeAssetId,
      amount: ExchangeMinimumAmount,
      memo: action.memo,
      trace_id: params.trace_id || uuidv4(),
      opponent_multisig: {
        receivers: action.mtg.members,
        threshold: action.mtg.threshold,
      },
    };
    return this.mixinApi.transfer.toAddress(this.keystore.pin, tx);
  }

  async bidOrder(
    collection_id: string,
    identerfier: number,
    params: {
      price: string;
      asset_id: string;
      expired_at?: number;
      trace_id?: string;
    }
  ): Promise<Object> {
    if (!this.keystore || !this.mixinApi) {
      throw new Error("keystore required");
    }

    const token_id = uniqueTokenId(collection_id, identerfier);
    const action = await this.createAction({
      type: "B",
      token_id: token_id,
      order_id: params.trace_id,
      price: params.price,
      expired_at: params.expired_at,
    });

    const tx = {
      asset_id: params.asset_id,
      amount: params.price,
      memo: action.memo,
      trace_id: params.trace_id || uuidv4(),
      opponent_multisig: {
        receivers: action.mtg.members,
        threshold: action.mtg.threshold,
      },
    };
    return this.mixinApi.transfer.toAddress(this.keystore.pin, tx);
  }

  async fillOrder(
    collection_id: string,
    identerfier: number,
    params: {
      order_id: string;
      trace_id?: string;
    }
  ): Promise<Object> {
    if (!this.keystore || !this.mixinApi) {
      throw new Error("keystore required");
    }

    const token_id = uniqueTokenId(collection_id, identerfier);
    const action = await this.createAction({
      type: "F",
      token_id: token_id,
      order_id: params.order_id,
    });

    const order = await this.order(params.order_id);
    if (!order) {
      throw new Error("no valid order found");
    }
    if (order.state != "open") {
      throw new Error(`order is ${order.state}`);
    }

    const tx = {
      asset_id: order.currency.asset_id,
      amount: order.price,
      memo: action.memo,
      trace_id: params.trace_id || uuidv4(),
      opponent_multisig: {
        receivers: action.mtg.members,
        threshold: action.mtg.threshold,
      },
    };
    return this.mixinApi.transfer.toAddress(this.keystore.pin, tx);
  }

  async cancelOrder(
    collection_id: string,
    identerfier: number,
    params: {
      order_id: string;
      trace_id?: string;
    }
  ): Promise<Object> {
    if (!this.keystore || !this.mixinApi) {
      throw new Error("keystore required");
    }

    const token_id = uniqueTokenId(collection_id, identerfier);
    const action = await this.createAction({
      type: "C",
      token_id: token_id,
      order_id: params.order_id,
    });

    const order = await this.order(params.order_id);
    if (!order) {
      throw new Error("no valid order found");
    }
    if (order.state != "open") {
      throw new Error(`order is ${order.state}`);
    }
    if (order.maker.id != this.keystore?.client_id) {
      throw new Error("you are not order maker");
    }

    const tx = {
      asset_id: ExchangeAssetId,
      amount: ExchangeMinimumAmount,
      memo: action.memo,
      trace_id: params.trace_id || uuidv4(),
      opponent_multisig: {
        receivers: action.mtg.members,
        threshold: action.mtg.threshold,
      },
    };
    return this.mixinApi.transfer.toAddress(this.keystore.pin, tx);
  }

  createAction(params: {
    type: "A" | "AU" | "B" | "F" | "C";
    token_id: string;
    order_id?: string;
    price?: string;
    asset_id?: string;
    reserve_price?: string;
    expired_at?: number;
  }): Promise<{
    memo: string;
    mtg: {
      members: string[];
      threshold: number;
    };
  }> {
    let data = {};
    switch (params.type) {
      case "A":
        data = {
          T: "A",
          N: params.token_id,
          O: params.order_id,
          P: params.price,
          A: params.asset_id,
          E: params.expired_at,
        };
        break;
      case "AU":
        data = {
          T: "AU",
          N: params.token_id,
          O: params.order_id,
          P: params.price,
          R: params.reserve_price,
          A: params.asset_id,
          E: params.expired_at,
        };
        break;
      case "B":
        data = {
          T: "B",
          N: params.token_id,
          O: params.order_id,
          P: params.price,
          E: params.expired_at,
        };
        break;
      case "F":
        data = {
          T: "F",
          N: params.token_id,
          O: params.order_id,
        };
        break;
      case "C":
        data = {
          T: "C",
          N: params.token_id,
          O: params.order_id,
        };
        break;
    }

    return this.api.post("/api/actions", data, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }

  accessToken(): string {
    if (!this.keystore) {
      throw new Error("keystore required");
    }

    return signAccessToken("GET", "/me", "", uuidv4(), {
      user_id: this.keystore.client_id,
      ...this.keystore,
    });
  }
}
