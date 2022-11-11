import forge from "node-forge";
import {
  parse as UUIDParse,
  stringify as uuidStringify,
  v4 as uuid,
} from "uuid";
import { SHA3 } from "sha3";
import { NfoDefaultChain, NfoDefaultClass } from "./constant";

export function uniqueTokenId(
  collection_id: string,
  identerfier: number
): string {
  const md5 = forge.md.md5.create();

  let bytes = Buffer.from(UUIDParse(NfoDefaultChain) as Buffer);
  bytes = Buffer.concat([bytes, Buffer.from(NfoDefaultClass, "hex")]);
  bytes = Buffer.concat([
    bytes,
    Buffer.from(UUIDParse(collection_id) as Buffer),
  ]);
  bytes = Buffer.concat([bytes, Buffer.from(getIntBytes(identerfier))]);

  md5.update(bytes.toString("binary"));

  bytes = Buffer.from(md5.digest().bytes(), "binary");

  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return uuidStringify(bytes);
}

export function getIntBytes(x: number) {
  const bytes = [];
  do {
    bytes.unshift(x & 255);
    x = (x / 2 ** 8) | 0;
  } while (x !== 0);
  return bytes;
}
