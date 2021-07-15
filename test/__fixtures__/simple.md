---
predicate: notB
---

```graphql schema
type Query {
  a: String
  b: String
}
```

```graphql operation
query Hello {
  a
  b
}
```

```graphql result
query Hello {
  a
}
```

```json masks
[["b"]]
```
