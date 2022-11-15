import { Client } from "../src/client";
import { v4 as uuidv4 } from "uuid";
import keystore from "./keystore.json";

describe("client", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client(
      Object.assign({}, keystore, { user_id: keystore.client_id })
    );
  });

  it("client created", () => {
    expect(client instanceof Client);
  });

  it("info", async () => {
    const res = await client.info();
    expect(res).toHaveProperty("members");
    expect(res).toHaveProperty("threshold");
  });

  it("collections", async () => {
    const res = await client.collections();
    expect(res).toHaveProperty("collections");
  });

  it("collection", async () => {
    const res = await client.collection("7ca0bd0c-ae7f-4bf0-a63a-20457f05f01f");
    expect(res).toHaveProperty("id");
  });

  it("update collection", async () => {
    const res = await client.updateCollection(
      "0fd8bb90-5a14-4d34-b448-996d26dd2672",
      {
        description: "Update from TridentSDKJS",
      }
    );
    expect(res).toHaveProperty("id");
  });

  it("collectible", async () => {
    const res = await client.collectible(
      "0aa776ce1bea943f279ff5d47b89fd72b145b1e89cb094f8064ffc58af0e162e"
    );
    expect(res).toHaveProperty("token");
  });

  it("orders", async () => {
    const res = await client.orders();
    expect(res).toHaveProperty("orders");
  });

  it("bid order", async () => {
    const res = await client.bidOrder(
      "dbef5999-fcb1-4f58-b84f-6b7af9694280",
      5000,
      {
        price: "0.11",
        asset_id: "31d2ea9c-95eb-3355-b65b-ba096853bc18",
        trace_id: uuidv4(),
        expired_at: Math.floor(Date.parse("2022-11-18") / 1000),
      }
    );
    expect(res).toHaveProperty("type");
  });

  it("cancel order", async () => {
    const orders = await client.orders({ maker_id: keystore.client_id });
    const res = await client.cancelOrder(
      "dbef5999-fcb1-4f58-b84f-6b7af9694280",
      5000,
      {
        order_id: orders.orders[0].id,
      }
    );
    expect(res).toHaveProperty("type");
  });

  it("create Actions", async () => {
    const res = await client.createAction({
      type: "A",
      token_id: "97701fb3-c773-31ed-aa6b-d85bcf3550df",
      price: "1.0",
      asset_id: "c6d0c728-2624-429b-8e0d-d9d19b6592fa",
      expired_at: Math.floor(Date.parse("2023-12-31") / 1000),
    });
    expect(res).toHaveProperty("memo");
    expect(res).toHaveProperty("mtg");
  });

  it("deposit", async () => {
    const res = await client.deposit(
      "dbef5999-fcb1-4f58-b84f-6b7af9694280",
      664
    );
    expect(res).toHaveProperty("hash");
  });

  it("airdrop", async () => {
    const res = await client.airdrop(
      "dbef5999-fcb1-4f58-b84f-6b7af9694280",
      664,
      { receiver_id: "7ed9292d-7c95-4333-aa48-a8c640064186" }
    );
    expect(res).toHaveProperty("hash");
  });

  it("withdraw", async () => {
    const res = await client.withdraw(
      "dbef5999-fcb1-4f58-b84f-6b7af9694280",
      664
    );
    expect(res).toHaveProperty("type");
  });
});
