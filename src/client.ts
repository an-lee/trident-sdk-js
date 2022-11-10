import {
  MixinApi,
  RequestClient,
  signAccessToken,
} from "@mixin.dev/mixin-node-sdk";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Collectible, Collection, Keystore, Metadata, Order } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Client {
  public keystore?: Keystore;
  public api: AxiosInstance;
  public mixinApi?: RequestClient;

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
    state?: "open" | "completed";
    type?: "ask" | "bid" | "auction";
    page?: number;
  }): Promise<{
    orders: Order[];
    current_page: number;
    next_page: number & null;
    previous_page: number & null;
  }> {
    return this.api.get("api/orders", { params });
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
