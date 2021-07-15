import { GraphQLError, Source, print } from "graphql";

/**
 * @param {{
 *  node: import("graphql").ASTNode;
 *  coordinate: string;
 *  operationNode: import("graphql").OperationDefinitionNode | null;
 *  document: import("graphql").DocumentNode;
 *  path: string[];
 * }} params
 * @returns {GraphQLError}
 */
export function makeNonNullFieldError({
  node,
  coordinate,
  operationNode,
  document,
  path,
}) {
  return new GraphQLError(
    `Non-null field ${coordinate} removed from operation ${operationNode?.name?.value}`,
    node,
    new Source(print(document)),
    undefined,
    path,
    undefined,
    {
      code: "REDACT_NON_NULL",
    }
  );
}

/**
 * @param {{
 *  node: import("graphql").OperationDefinitionNode;
 *  document: import("graphql").DocumentNode;
 * }} params
 * @returns {GraphQLError}
 */
export function makeEmptyOperationError({ node, document }) {
  return new GraphQLError(
    `All fields removed from operation ${node.name?.value}`,
    node,
    new Source(print(document)),
    undefined,
    undefined,
    undefined,
    {
      code: "REDACT_EMPTY_OPERATION",
    }
  );
}
