import { Client } from "../src/client";
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
});
