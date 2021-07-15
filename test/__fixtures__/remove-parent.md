---
predicate: notB
---

```graphql schema
type Query {
  a: A
  c: String
}

type A {
  b: String
}
```

```graphql operation
query Hello {
  a {
    b
  }
  c
}
```

```graphql result
query Hello {
  c
}
```

```json masks
[["a", "b"]]
```
