import { ApolloServer, AuthenticationError, gql } from "apollo-server";
import { getDirectives } from "@graphql-tools/utils";
import { jwtVerify } from "jose-node-esm-runtime/jwt/verify";
import { redactionPlugin } from "./plugin.js";
import { PUBLIC_KEY } from "./jwk.js";
import { GraphQLError } from "graphql";

const typeDefs = gql`
  directive @requires(scopes: [String!]!) on FIELD_DEFINITION

  type Query {
    customer(id: ID!): Customer
  }

  type Customer {
    id: ID! @requires(scopes: "customers:read")
    name: String!
    emailAddress: String @requires(scopes: "customers:read:pii")
  }
`;

const resolvers = {
  Query: {
    /**
     * @param {any} _
     * @param {{ id: string }} args
     */
    customer(_, { id }) {
      return {
        id,
        name: "Morty Smith",
        emailAddress: "morty@example.com",
      };
    },
  },
};

/**
 * @typedef Context
 * @property {{ scope: string[] }} claims
 */

/**
 * @type {import("../../src/typings.js").Predicate<Context>}
 */
function predicate({ schema, field, context, coordinate }) {
  const { requires } = getDirectives(schema, field);

  if (requires) {
    /** @type {string[]} */
    const requiredScopes = Array.isArray(requires.scopes)
      ? requires.scopes
      : [requires.scopes];

    if (requiredScopes.some((scope) => !context.claims.scope.includes(scope))) {
      return {
        allowed: false,
        error: new GraphQLError(
          `Access denied to ${coordinate}`,
          null,
          null,
          null,
          null,
          null,
          {
            code: "ACCESS_DENIED",
          }
        ),
      };
    }
  }

  return { allowed: true };
}

const server = new ApolloServer({
  typeDefs,
  resolvers,

  async context({ req }) {
    if (!req.headers["authorization"]?.startsWith("Bearer ")) {
      throw new AuthenticationError("Not authenticated");
    }

    const token = req.headers["authorization"].slice(7);

    const { payload } = await jwtVerify(token, PUBLIC_KEY, {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    });

    return {
      claims: payload,
    };
  },
  plugins: [redactionPlugin(predicate)],
});

const { url } = await server.listen(process.env.PORT ?? 4000);
console.log(`Listening at ${url}`);
