import {
  GraphQLError,
  isNonNullType,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from "graphql";
import { makeEmptyOperationError, makeNonNullFieldError } from "./errors.js";
import { VariableTracker } from "./variables.js";
import { FragmentTracker } from "./fragments.js";

/**
 * @template T
 * @param {import("graphql").DocumentNode} operation
 * @param {import("graphql").GraphQLSchema} schema
 * @param {T} context
 * @param {import("./typings").Predicate<T>} predicate
 * @returns {import("./typings").RedactResult}
 */
export function redact(operation, schema, context, predicate) {
  const typeInfo = new TypeInfo(schema);

  /** @type {import("graphql").OperationDefinitionNode | null} */
  let currentOperation = null;

  /** @type {string[][]} */
  const masks = [];

  /** @type {string[]} */
  const parentStack = [];

  const variables = new VariableTracker();
  const fragments = new FragmentTracker();

  /** @type {GraphQLError[]} */
  const errors = [];

  // When fragments occur after the operation, we need to revisit the whole
  // document to remove fragment spreads for empty fragments (which may cause
  // more fields to be removed in turn.)
  let shouldRevisit = false;

  let newOperation = operation;

  do {
    shouldRevisit = false;
    newOperation = visit(
      newOperation,

      visitWithTypeInfo(typeInfo, {
        Field: {
          enter(node) {
            const parentType = typeInfo.getParentType();
            assert(parentType);

            const field = typeInfo.getFieldDef();
            const coordinate = `${parentType.name}.${field.name}`;

            const result = predicate({
              field,
              parentType,
              coordinate,
              schema,
              context,
            });

            const variableNames = variables.forField(node);

            if (!result.allowed) {
              const path = [
                ...parentStack,
                node.alias?.value ?? node.name.value,
              ];
              masks.push(path);

              variables.markRemoved(variableNames);

              if (result.error) {
                errors.push(result.error);
              }

              if (isNonNullType(field.type)) {
                errors.push(
                  makeNonNullFieldError({
                    node,
                    coordinate,
                    operationNode: currentOperation,
                    document: operation,
                    path,
                  })
                );
              }

              return null;
            } else {
              variables.markUsed(variableNames);
            }
          },

          leave(node) {
            if (node.selectionSet?.selections?.length === 0) {
              const parentType = typeInfo.getParentType();
              assert(parentType);

              const field = typeInfo.getFieldDef();
              const coordinate = `${parentType.name}.${field.name}`;

              const path = [
                ...parentStack,
                node.alias?.value ?? node.name.value,
              ];

              if (isNonNullType(field.type)) {
                errors.push(
                  makeNonNullFieldError({
                    node,
                    coordinate,
                    operationNode: currentOperation,
                    document: operation,
                    path,
                  })
                );
              }

              return null;
            }
          },
        },

        SelectionSet: {
          enter(_node, _key, parent) {
            if (parent && "kind" in parent && parent.kind === "Field") {
              parentStack.push(parent.alias?.value ?? parent.name.value);
            }
          },

          leave(_node) {
            parentStack.pop();
          },
        },

        OperationDefinition: {
          enter(node) {
            currentOperation = node;
          },

          leave(node) {
            currentOperation = null;

            if (node.selectionSet.selections.length === 0) {
              errors.push(
                makeEmptyOperationError({ node, document: operation })
              );
            }

            return {
              ...node,
              variableDefinitions: variables.redactDefinitions(
                node.variableDefinitions ?? []
              ),
            };
          },
        },

        InlineFragment: {
          leave(node) {
            if (node.selectionSet.selections.length === 0) {
              return null;
            }
          },
        },

        FragmentDefinition: {
          enter(node) {
            parentStack.push(`Fragment:${node.name.value}`);
          },

          leave(node) {
            parentStack.pop();

            if (node.selectionSet.selections.length === 0) {
              fragments.markForRemoval(node.name.value);
              shouldRevisit = true;
              return null;
            }
          },
        },

        FragmentSpread: {
          enter(node, _key, _parent, path) {
            fragments.recordParentsForSpread(
              node.name.value,
              parentStack.slice(),
              path
            );
          },

          leave(node) {
            if (fragments.shouldRemove(node.name.value)) {
              return null;
            }
          },
        },
      })
    );
  } while (shouldRevisit);

  const allMasks = fragments.expandMasks(masks);

  if (errors.length) {
    return {
      ok: false,
      errors,
      masks: allMasks,
    };
  }

  return {
    ok: true,
    operation: newOperation,
    masks: allMasks,
  };
}

/**
 * @param {any} value
 * @returns {asserts value}
 */
function assert(value) {
  if (!value) {
    throw new Error("failed assertion");
  }
}
