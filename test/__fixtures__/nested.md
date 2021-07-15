---
predicate: notB
---

```graphql schema
type Query {
  a: A
}

type A {
  b: String
  c: String
}
```

```graphql operation
query Hello {
  a {
    b
    c
  }
}
```

```graphql result
query Hello {
  a {
    c
  }
}
```

```json masks
[["a", "b"]]
```
