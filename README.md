# GraphQL Operation Redactor

A function for redacting fields from a GraphQL operation before execution and
another function for enriching the response with `null`s.

Removing fields from a GraphQL `DocumentNode` is not as simple as you might
think! This package ensures that the redacted operation is still a valid GraphQL
document, without any empty selection sets, unused variables, or invalid
fragments.

## ⚠️ Disclaimer ⚠️

This project is experimental and is not a fully-supported Apollo Graph project.
We may not respond to issues and pull requests at this time.

## Installation

Not yet published to an NPM repository.

```sh
yarn add github:apollosolutions/graphql-operation-redactor
```

## Usage

```js
import { redact, enrich } from '@apollosolutions/graphql-operation-redactor';
import { buildSchema, executeSync, parse, print } from 'graphql';

function predicate({ field }) {
  if (field.name === 'superSecret') {
    return { allowed: false };
  }
  return { allowed: true };
}

const schema = buildSchema(`
  type Query {
    notSecret: String
    superSecret: String
  }
`);

const operation = parse('{ notSecret superSecret }');

const result = redact(operation, schema, {}, predicate);

console.log(print(result.operation));
/* query { notSecret } */

const response = executeSync({ document: result.operation, schema, ... });
/* { data: { notSecret: "hello" } } */

const enriched = enrich(response, masks);
/* { data: { notSecret: "hello", superSecret: null } } */
```

## Examples

- [Apollo Server](./examples/apollo)
