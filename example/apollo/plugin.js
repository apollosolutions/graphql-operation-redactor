import { redact, enrich } from "../../src/index.js";

const redactionStorage = new WeakMap();

/** @type {(predicate: import("../../src/typings.js").Predicate<*>) => import('apollo-server-plugin-base').ApolloServerPlugin} */
export function redactionPlugin(predicate) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(ctx) {
          const { document, schema, context } = ctx;

          const result = redact(document, schema, context, predicate);

          if (result.ok) {
            // @ts-ignore - readonly!
            ctx.document = result.operation;
            redactionStorage.set(context, {
              masks: result.masks,
              errors: result.errors,
            });
          } else {
            throw result.errors[0];
          }
        },
        async willSendResponse(ctx) {
          const redaction = redactionStorage.get(ctx.context);

          if (redaction) {
            const { masks, errors } = redaction;

            // @ts-ignore - readonly!
            ctx.response = {
              ...ctx.response,
              ...enrich(ctx.response, masks ?? [], errors),
            };
          }
        },
      };
    },
  };
}
