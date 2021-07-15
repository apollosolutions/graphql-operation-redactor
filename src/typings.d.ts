import {
  DocumentNode,
  GraphQLError,
  GraphQLField,
  GraphQLNamedType,
  GraphQLFormattedError,
  GraphQLSchema,
} from "graphql";

export interface PredicateContext<
  T extends Record<string | number | symbol, any>
> {
  field: GraphQLField<*, *>;
  parentType: GraphQLNamedType;
  schema: GraphQLSchema;
  coordinate: string;
  context: T;
}

export type Predicate<T> = (_: PredicateContext<T>) => PredicateResult;

export type PredicateResult = PredicateAllowed | PredicateDenied;

export interface PredicateAllowed {
  allowed: true;
}

export interface PredicateDenied {
  allowed: false;
  error?: GraphQLError;
}

export type RedactResult = RedactResultOk | RedactResultErr;

export interface RedactResultOk {
  ok: true;
  operation: DocumentNode;
  masks: string[][];
}

export interface RedactResultErr {
  ok: false;
  errors: GraphQLError[];
  masks: string[][];
}

interface Response {
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  extensions?: Record<string, any>;
}
