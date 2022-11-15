var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import {
  buildNfoTransferRequest,
  buildTokenId,
  MixinApi,
  signAccessToken,
} from "@mixin.dev/mixin-node-sdk";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ExchangeAssetId, ExchangeMinimumAmount, TridentMTG } from "./constant";
export class Client {
  constructor(keystore) {
    this.keystore = keystore;
    this.api = axios.create({
      baseURL: "https://thetrident.one",
    });
    if (keystore) {
      this.mixinApi = MixinApi({
        keystore: Object.assign({ user_id: keystore.client_id }, keystore),
      });
    }
    this.api.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  info() {
    return this.api.get("api");
  }
  collections() {
    return this.api.get("api/collections", {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }
  collection(id) {
    return this.api.get(`api/collections/${id}`);
  }
  createCollection(params) {
    return this.api.post(`api/collections`, params, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }
  updateCollection(id, params) {
    return this.api.put(`api/collections/${id}`, params, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }
  collectible(metahash) {
    return this.api.get(`api/collectibles/${metahash}`);
  }
  uploadMetadata(params) {
    return this.api.post("api/collectibles", params, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }
  deposit(collection_id, identifier) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      let collectible = yield this.findCollectible(token_id, "unspent");
      if (!collectible) {
        collectible = yield this.findCollectible(token_id, "signed");
      }
      if (!collectible) throw new Error("cannot find collectible in wallet");
      const request = yield buildNfoTransferRequest(
        this.mixinApi,
        collectible.transaction_hash,
        TridentMTG.members,
        TridentMTG.threshold,
        Buffer.from("DEPOSIT").toString("hex")
      );
      const signed = yield this.mixinApi.collection.sign(
        this.keystore.pin,
        request.request_id
      );
      return this.mixinApi.external.proxy({
        method: "sendrawtransaction",
        params: [signed.raw_transaction],
      });
    });
  }
  withdraw(collection_id, identifier, params) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      const action = yield this.createAction({
        type: "W",
        token_id: token_id,
      });
      const tx = {
        asset_id: ExchangeAssetId,
        amount: ExchangeMinimumAmount,
        memo: action.memo,
        trace_id:
          (params === null || params === void 0 ? void 0 : params.trace_id) ||
          uuidv4(),
        opponent_multisig: {
          receivers: action.mtg.members,
          threshold: action.mtg.threshold,
        },
      };
      return this.mixinApi.transfer.toAddress(this.keystore.pin, tx);
    });
  }
  airdrop(collection_id, identifier, params) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      let collectible = yield this.findCollectible(token_id, "unspent");
      if (!collectible) {
        collectible = yield this.findCollectible(token_id, "signed");
      }
      if (!collectible) throw new Error("cannot find collectible in wallet");
      if (collectible.state == "signed") {
        return this.mixinApi.external.proxy({
          method: "sendrawtransaction",
          params: [collectible.signed_tx],
        });
      }
      const action = yield this.createAction({
        type: "AD",
        receiver_id:
          params === null || params === void 0 ? void 0 : params.receiver_id,
        started_at:
          params === null || params === void 0 ? void 0 : params.started_at,
      });
      const request = yield buildNfoTransferRequest(
        this.mixinApi,
        collectible.transaction_hash,
        action.mtg.members,
        action.mtg.threshold,
        Buffer.from(action.memo).toString("hex")
      );
      const signed = yield this.mixinApi.collection.sign(
        this.keystore.pin,
        request.request_id
      );
      return this.mixinApi.external.proxy({
        method: "sendrawtransaction",
        params: [signed.raw_transaction],
      });
    });
  }
  orders(params) {
    return this.api.get("api/orders", { params });
  }
  order(id) {
    return this.api.get(`api/orders/${id}`);
  }
  askOrder(collection_id, identifier, params) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      const action = yield this.createAction({
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
    });
  }
  auctionOrder(collection_id, identifier, params) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      const action = yield this.createAction({
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
    });
  }
  bidOrder(collection_id, identifier, params) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      const action = yield this.createAction({
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
    });
  }
  fillOrder(collection_id, identifier, params) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      const action = yield this.createAction({
        type: "F",
        token_id: token_id,
        order_id: params.order_id,
      });
      const order = yield this.order(params.order_id);
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
    });
  }
  cancelOrder(collection_id, identifier, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const token_id = buildTokenId(collection_id, identifier);
      const action = yield this.createAction({
        type: "C",
        token_id: token_id,
        order_id: params.order_id,
      });
      const order = yield this.order(params.order_id);
      if (!order) {
        throw new Error("no valid order found");
      }
      if (order.state != "open") {
        throw new Error(`order is ${order.state}`);
      }
      if (
        order.maker.id !=
        ((_a = this.keystore) === null || _a === void 0 ? void 0 : _a.client_id)
      ) {
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
    });
  }
  createAction(params) {
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
      case "W":
        data = {
          T: "W",
          N: params.token_id,
        };
        break;
      case "AD":
        data = {
          T: "AD",
          RC: params.receiver_id,
          S: params.started_at,
        };
        break;
    }
    return this.api.post("/api/actions", data, {
      headers: {
        Authorization: `Bearer ${this.accessToken()}`,
      },
    });
  }
  accessToken() {
    if (!this.keystore) {
      throw new Error("keystore required");
    }
    return signAccessToken(
      "GET",
      "/me",
      "",
      uuidv4(),
      Object.assign({ user_id: this.keystore.client_id }, this.keystore)
    );
  }
  findCollectible(token_id, state, offset = "") {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.keystore || !this.mixinApi) {
        throw new Error("keystore required");
      }
      const outputs = yield this.mixinApi.collection.outputs({
        state,
        limit: 500,
        offset,
        members: [this.keystore.client_id],
        threshold: 1,
      });
      const output = outputs.find((c) => c.token_id == token_id);
      offset = outputs[outputs.length - 1].updated_at;
      if (output) {
        return output;
      } else if (outputs.length == 500) {
        return this.findCollectible(token_id, state, offset);
      } else {
        return null;
      }
    });
  }
}
//# sourceMappingURL=client.js.map
