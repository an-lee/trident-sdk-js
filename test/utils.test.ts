import { uniqueTokenId } from "../src/utils";

describe("utils", () => {
  it("generate unique UUID from collection and identerfier", () => {
    const collection = "8206c6c8-3379-4237-b0b0-6dd2387bdbbe";
    const identerfier = 1;
    const tokenId = uniqueTokenId(collection, identerfier);
    expect(tokenId).toEqual("b386658f-07fd-3176-998d-b18f3ae4558b");
  });
});
