# Trident SDK JS

A simple SDK for [Trident](https://thetrident.one)

## Install

```bash
yarn add trident-sdk-js
```

or

```bash
npm install trident-sdk-js
```

## Usage

```javascript
import { Client } from "trident-sdk-js";
import keystore from "./keystore.json";
import { v4 as uuidv4 } from "uuid";

const client = new Client(keystore);

// MTG info
const info = await client.info();
console.log(info);

// collection
const collection = await client.collection(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
);

// createCollection
const collection = await client.createCollection({
  name: "TEST collection",
  symbol: "TEST",
  description: "A test",
  split: "0.1",
  external_url: "https://xxx.xxx",
  icon_url: "", // optional, use url or base64
  icon_base64: "", // optional
});

// my collections

const collections = await client.collections();

// update collection
const collection = await client.updateCollection(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  {
    description: "updated description",
  }
);

// NFO metadata
const collectible = await client.collectible(
  "0aa776ce1bea943f279ff5d47b89fd72b145b1e89cb094f8064ffc58af0e162e"
);

// update Metadata
const collectible = await client.updateMetadata({
  metadata: {},
  metahash: "0aa776ce1bea943f279ff5d47b89fd72b145b1e89cb094f8064ffc58af0e162e",
});

// deposit NFT
await client.deposit("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 1);

// withdraw NFT
await client.withdraw("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 1);

// transfer NFT
await client.transfer("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 1, {
  receivers: ["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],
  threshold: 1,
  memo: "Gift",
});

// get Orders
const orders = await client.orders();

// ask order
const order = await client.askOrder(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // collection ID
  1, // Identifier
  {
    price: "0.11",
    asset_id: "31d2ea9c-95eb-3355-b65b-ba096853bc18",
    trace_id: uuidv4(),
    expired_at: Math.floor(Date.parse("2022-11-18") / 1000),
  }
);

// auction order
const order = await client.auctionOrder(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // collection ID
  1, // Identifier
  {
    price: "0.11",
    reserve_price: "0.2",
    asset_id: "31d2ea9c-95eb-3355-b65b-ba096853bc18",
    trace_id: uuidv4(),
    expired_at: Math.floor(Date.parse("2022-11-18") / 1000),
  }
);

// bid order
const order = await client.bidOrder(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // collection ID
  1, // Identifier
  {
    price: "0.11",
    asset_id: "31d2ea9c-95eb-3355-b65b-ba096853bc18",
    trace_id: uuidv4(),
    expired_at: Math.floor(Date.parse("2022-11-18") / 1000),
  }
);

// fill order
const order = await client.fillOrder(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // collection ID
  1, // Identifier
  {
    price: "0.11",
    asset_id: "31d2ea9c-95eb-3355-b65b-ba096853bc18",
    order_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    trace_id: uuidv4(),
  }
);

// cancel order
const order = await client.cancelOrder(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // collection ID
  1, // Identifier
  {
    order_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    trace_id: uuidv4(),
  }
);
```
