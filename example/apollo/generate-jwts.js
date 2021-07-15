import * as keys from "./jwk.js";
import { SignJWT } from "jose-node-esm-runtime/jwt/sign";

const adminJwt = await new SignJWT({
  scope: ["customers:read", "customers:read:pii"],
})
  .setProtectedHeader({ alg: "ES256" })
  .setIssuedAt()
  .setIssuer("urn:example:issuer")
  .setAudience("urn:example:audience")
  .sign(keys.PUBLIC_PRIVATE_KEY);

console.log("JWT with read:pii");
console.log("-".repeat(24));
console.log(adminJwt);

console.log("");

const unscopedJwt = await new SignJWT({
  scope: ["customers:read"],
})
  .setProtectedHeader({ alg: "ES256" })
  .setIssuedAt()
  .setIssuer("urn:example:issuer")
  .setAudience("urn:example:audience")
  .sign(keys.PUBLIC_PRIVATE_KEY);

console.log("JWT without read:pii");
console.log("-".repeat(24));
console.log(unscopedJwt);
