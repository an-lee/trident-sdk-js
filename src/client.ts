import {
  MixinApi,
  RequestClient,
  signAccessToken,
} from "@mixin.dev/mixin-node-sdk";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Keystore, Order } from "./types";
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
    if (!this.keystore) {
      throw new Error("keystore required");
    }

    const authorization = signAccessToken("GET", "/me", "", uuidv4(), {
      user_id: this.keystore.client_id,
      ...this.keystore,
    });

    return this.api.get("api/collections", {
      headers: {
        Authorization: `Bearer ${authorization}`,
      },
    });
  }

  collection(id: string) {
    return this.api.get(`api/collections/${id}`);
  }

  collectible(metahash: string) {
    return this.api.get(`api/collectibles/${metahash}`);
  }

  orders(): Promise<{
    orders: Order[];
    current_page: number;
    next_page: number & null;
    previous_page: number & null;
  }> {
    return this.api.get("api/orders");
  }
}
