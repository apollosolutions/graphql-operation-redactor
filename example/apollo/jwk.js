import { parseJwk } from "jose-node-esm-runtime/jwk/parse";

const PUBLIC_JWK = {
  kty: "EC",
  use: "sig",
  crv: "P-256",
  kid: "sig-2021-07-15T15:52:34Z",
  x: "Sxdy-Ce-1UwXu06AoTpV12Crvu1LqxP0g5dE0O5_YgY",
  y: "EWyOkyqiRVhF1BnE2V914hObrrGxSzqBAjm9F-SSfuI",
  alg: "ES256",
};

export const PUBLIC_KEY = await parseJwk(PUBLIC_JWK);

const PUBLIC_PRIVATE_KEYPAIR_JWK = {
  kty: "EC",
  d: "GNJvM-hqp43bl5EHBbagxKl0QAmD5bZudrIWpY3YhpA",
  use: "sig",
  crv: "P-256",
  kid: "sig-2021-07-15T15:52:34Z",
  x: "Sxdy-Ce-1UwXu06AoTpV12Crvu1LqxP0g5dE0O5_YgY",
  y: "EWyOkyqiRVhF1BnE2V914hObrrGxSzqBAjm9F-SSfuI",
  alg: "ES256",
};

export const PUBLIC_PRIVATE_KEY = await parseJwk(PUBLIC_PRIVATE_KEYPAIR_JWK);
